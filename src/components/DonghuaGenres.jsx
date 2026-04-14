import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { animeAPI } from '../services/api';

const DonghuaGenres = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, genres, years, seasons

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        const response = await animeAPI.getDonghuaGenres();
        const allGenres = response?.data || [];
        
        // Remove duplicates
        const uniqueGenres = Array.from(
          new Map(allGenres.map(item => [item.slug, item])).values()
        );
        
        setGenres(uniqueGenres);
      } catch (err) {
        setError(err?.message ?? 'Gagal memuat genre');
      } finally {
        setLoading(false);
      }
    };
    fetchGenres();
  }, []);

  const categorizeGenres = () => {
    const categories = {
      genres: [],
      years: [],
      seasons: [],
    };

    genres.forEach(item => {
      const name = item.name.toLowerCase();
      
      // Check if it's a year (2014-2026)
      if (/^\d{4}$/.test(item.name) && parseInt(item.name) >= 2014 && parseInt(item.name) <= 2026) {
        categories.years.push(item);
      }
      // Check if it's a season (Spring 2022, Summer 2023, etc)
      else if (/(spring|summer|fall|winter|autumn)\s+\d{4}/i.test(item.name)) {
        categories.seasons.push(item);
      }
      // Otherwise it's a genre
      else {
        categories.genres.push(item);
      }
    });

    return categories;
  };

  const { genres: genreList, years, seasons } = categorizeGenres();

  const getFilteredList = () => {
    switch (filter) {
      case 'genres': return genreList;
      case 'years': return years.sort((a, b) => b.name.localeCompare(a.name));
      case 'seasons': return seasons;
      default: return genres;
    }
  };

  const filteredList = getFilteredList();

  if (loading) {
    return (
      <div className="loading-container main-container">
        <div className="spinner" />
        <p>Memuat genre...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container main-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="main-container">
      <header className="page-header">
        <h1 className="main-title">Genre Donghua</h1>
        <p className="subtitle">{filteredList.length} kategori</p>
      </header>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Semua ({genres.length})
        </button>
        <button
          className={`filter-tab ${filter === 'genres' ? 'active' : ''}`}
          onClick={() => setFilter('genres')}
        >
          Genre ({genreList.length})
        </button>
        <button
          className={`filter-tab ${filter === 'years' ? 'active' : ''}`}
          onClick={() => setFilter('years')}
        >
          Tahun ({years.length})
        </button>
        <button
          className={`filter-tab ${filter === 'seasons' ? 'active' : ''}`}
          onClick={() => setFilter('seasons')}
        >
          Season ({seasons.length})
        </button>
      </div>

      <div className="genre-grid">
        {filteredList.map((item, idx) => (
          <Link
            key={item.slug || idx}
            to={`/donghua-genre/${item.slug}`}
            className="genre-card"
          >
            <span className="genre-name">{item.name}</span>
            <span className="genre-arrow">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DonghuaGenres;
