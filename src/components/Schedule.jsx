import { useEffect, useState } from 'react';
import { animeAPI } from '../services/api';
import { SkeletonAnimeGrid } from './Skeleton';
import AnimeCard from './AnimeCard';
import ErrorPage from './ErrorPage';
import './Schedule.css';

const normalizeKey = (item) => 
  (item.title || item.name || '').toString().toLowerCase().replace(/\s+/g, ' ').trim();

const mergeScheduleLists = (list1, list2) => {
  const map = new Map();
  
  list1.forEach((a) => {
    const key = normalizeKey(a);
    map.set(key, { ...a, providers: ['otakudesu'], provider: 'otakudesu' });
  });
  
  list2.forEach((a) => {
    const key = normalizeKey(a);
    const existing = map.get(key);
    if (existing) {
      map.set(key, { ...existing, providers: ['otakudesu', 'samehadaku'] });
    } else {
      map.set(key, { ...a, providers: ['samehadaku'], provider: 'samehadaku' });
    }
  });
  
  return Array.from(map.values());
};

const Schedule = () => {
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const [otakRes, sameRes] = await Promise.all([
          animeAPI.getSchedule().catch(() => null),
          animeAPI.getScheduleSamehadaku().catch(() => null),
        ]);
        
        // Merge schedules from both providers
        const otakDays = Array.isArray(otakRes?.data) ? otakRes.data : [];
        const sameDays = Array.isArray(sameRes?.data?.schedule) ? sameRes.data.schedule : [];
        
        // Combine by day
        const dayMap = new Map();
        const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        
        const processDay = (dayItem, provider) => {
          const dayName = dayItem.day || dayNames[dayNames.indexOf(dayItem.day)];
          const list = dayItem.anime_list ?? dayItem.animeList ?? dayItem.list ?? [];
          
          if (!dayMap.has(dayName)) {
            dayMap.set(dayName, []);
          }
          
          const merged = mergeScheduleLists(dayMap.get(dayName), list.map(a => ({ ...a, provider })));
          dayMap.set(dayName, merged);
        };
        
        otakDays.forEach(d => processDay(d, 'otakudesu'));
        sameDays.forEach(d => processDay(d, 'samehadaku'));
        
        const mergedDays = Array.from(dayMap.entries()).map(([day, animeList]) => ({
          day,
          animeList,
        }));
        
        setScheduleData({ data: mergedDays });
      } catch (err) {
        const msg = (err?.message ?? (typeof err?.toString === 'function' ? err.toString() : String(err))) || 'Gagal memuat jadwal';
        setError(String(msg));
        console.error('Schedule fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  if (loading) {
    return (
      <div className="schedule-page main-container">
        <header className="page-header schedule-hero">
          <div className="skeleton skeleton-text" style={{ height: 40, width: 200 }} />
          <div className="skeleton skeleton-text" style={{ height: 20, width: 320, marginTop: 8 }} />
        </header>
        <section className="schedule-section section section-neo">
          <SkeletonAnimeGrid count={6} />
        </section>
      </div>
    );
  }

  if (error != null && error !== '') {
    return (
      <div className="main-container">
        <ErrorPage
          title="Jadwal Tayang"
          message={`Gagal memuat jadwal: ${error}`}
          hint="Server mungkin sedang bermasalah (mis. error 500). Coba lagi nanti."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // API returns { data: [ { day, anime_list: [ { title, slug, url, poster } ] }, ... ] }
  const days = Array.isArray(scheduleData?.data) ? scheduleData.data : (scheduleData?.schedule ?? []);
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  return (
    <div className="schedule-page main-container">
      <header className="page-header schedule-hero section section-neo">
        <h1 className="main-title text-gradient">Jadwal Tayang</h1>
        <p className="subtitle">Anime yang tayang per hari</p>
      </header>

      {days.length > 0 ? (
        days.map((dayItem, idx) => {
          const dayName = dayItem.day ?? dayItem.day ?? `Day ${idx + 1}`;
          const list = dayItem.animeList ?? dayItem.anime_list ?? dayItem.anime ?? [];
          return (
            <section key={`${dayName}-${idx}`} className="schedule-day-section section section-neo">
              <div className="section-header section-header-neo">
                <h2 className="section-title section-title-neo">{dayName}</h2>
              </div>
              <div className="anime-grid">
                {list.map((anime, i) => {
                  const providers = anime.providers || [anime.provider];
                  const hasOtak = providers.includes('otakudesu');
                  const hasSame = providers.includes('samehadaku');
                  const providerHint = hasOtak && hasSame ? 'Otakudesu & Samehadaku' : (hasSame ? 'Samehadaku' : 'Otakudesu');
                  
                  return (
                    <AnimeCard
                      key={anime.animeId ?? anime.slug ?? i}
                      anime={{ ...anime, animeId: anime.animeId ?? anime.slug, provider: anime.provider ?? 'otakudesu' }}
                      index={i}
                      providerHint={providerHint}
                    />
                  );
                })}
              </div>
            </section>
          );
        })
      ) : (
        <div className="schedule-no-data no-data">Belum ada data jadwal.</div>
      )}
    </div>
  );
};

export default Schedule;
