import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { animeAPI } from '../services/api';
import ThemeToggle from './ThemeToggle';
import './Header.css';
import './Search.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    setMobileMenuOpen(false);
    setShowDropdown(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        return;
      }
      setSearchLoading(true);
      try {
        const data = await animeAPI.searchAll(debouncedQuery);
        
        // Combine results from both providers
        const otakList = data?.otakudesu?.data?.animeList || data?.otakudesu?.animeList || [];
        const sameList = data?.samehadaku?.data?.animeList || data?.samehadaku?.animeList || [];
        
        // Merge duplicates and add provider info
        const normalizeKey = (item) => 
          (item.title || item.name || '').toString().toLowerCase().replace(/\s+/g, ' ').trim();
        
        const map = new Map();
        
        otakList.forEach((a) => {
          const key = normalizeKey(a);
          map.set(key, { ...a, providers: ['otakudesu'] });
        });
        
        sameList.forEach((a) => {
          const key = normalizeKey(a);
          const existing = map.get(key);
          if (existing) {
            map.set(key, { ...existing, providers: [...new Set([...existing.providers, 'samehadaku'])] });
          } else {
            map.set(key, { ...a, providers: ['samehadaku'] });
          }
        });
        
        const mergedList = Array.from(map.values());
        const results = Array.isArray(mergedList) ? mergedList.slice(0, 5) : [];
        setSuggestions(results);
      } catch (err) {
        console.error('Search error:', err);
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    };
    fetchSuggestions();
  }, [debouncedQuery]);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  const handleSearch = (searchQuery = query) => {
    if (searchQuery.trim()) {
      navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
      setShowDropdown(false);
      setQuery(searchQuery);
      closeMobileMenu();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const title = suggestion.title || suggestion.name;
    setQuery(title);
    handleSearch(title);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') setShowDropdown(false);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/ongoing', label: 'Anime Ongoing' },
    { to: '/completed', label: 'Anime Completed' },
    { to: '/donghua-ongoing', label: 'Donghua Ongoing' },
    { to: '/donghua-completed', label: 'Donghua Completed' },
    { to: '/genres', label: 'Genres' },
    { to: '/az-list', label: 'A-Z' },
    { to: '/schedule', label: 'Schedule' },
    { to: '/history', label: 'Riwayat' },
  ];

  return (
    <>
    <header className="header">
      <nav className="nav-container" aria-label="Main navigation">
        <div className="nav-brand">
          <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
            <img src="/favicon.svg" alt="Funknime" className="logo-image" />
            <span className="logo-text">Funknime</span>
          </Link>
        </div>

        <div className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`} role="navigation">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link ${location.pathname === to ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          <div className="search-container header-search">
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Cari anime..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                onKeyDown={handleSearchKeyDown}
                aria-label="Cari anime"
              />
              <button
                type="button"
                className="search-btn"
                onClick={() => handleSearch()}
                aria-label="Cari"
              >
                🔍
              </button>
              {searchLoading && <div className="search-spinner" />}
              {showDropdown && suggestions.length > 0 && (
                <div className="search-dropdown">
                  {suggestions.map((anime, idx) => {
                    const providers = anime.providers || [];
                    const hasOtak = providers.includes('otakudesu');
                    const hasSame = providers.includes('samehadaku');
                    const providerHint = hasOtak && hasSame ? '2 Provider' : (hasSame ? 'Samehadaku' : 'Otakudesu');
                    
                    return (
                      <div
                        key={anime.animeId ?? anime.slug ?? idx}
                        className="search-suggestion"
                        onClick={() => handleSuggestionClick(anime)}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <img
                          src={anime.poster || anime.poster_url || undefined}
                          alt={anime.title || anime.name || 'Anime'}
                          className="suggestion-poster"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/44x64/2e2e2e/666?text=?'; }}
                        />
                        <div className="suggestion-info">
                          <div className="suggestion-title">{anime.title || anime.name}</div>
                          <div className="suggestion-meta">
                            {providerHint && <span className="provider-badge">{providerHint}</span>}
                            {anime.episodes && <span>{anime.episodes} eps</span>}
                            {anime.score && <span>⭐ {anime.score}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <ThemeToggle />
          <button
            type="button"
            className="nav-mobile-menu"
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
          >
            <span className="hamburger" aria-hidden>
              {mobileMenuOpen ? '✕' : '☰'}
            </span>
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <button
          type="button"
          className="nav-overlay"
          onClick={closeMobileMenu}
          aria-label="Tutup menu"
        />
      )}
    </header>

    {/* Tombol search floating khusus mobile */}
    {!mobileMenuOpen && !location.pathname.startsWith('/search') && (
      <Link to="/search" className="mobile-search-fab" aria-label="Cari anime (mobile)">
        🔍
      </Link>
    )}
    </>
  );
};

export default Header;
