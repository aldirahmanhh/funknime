import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
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

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  const navLinks = [
    { to: '/', label: 'Home' },
    { 
      label: 'Anime',
      submenu: [
        { to: '/ongoing', label: 'Ongoing' },
        { to: '/completed', label: 'Completed' },
      ]
    },
    { 
      label: 'Donghua',
      submenu: [
        { to: '/donghua-ongoing', label: 'Ongoing' },
        { to: '/donghua-completed', label: 'Completed' },
        { to: '/donghua-genres', label: 'Genres' },
        { to: '/donghua-az', label: 'A-Z List' },
      ]
    },
    { 
      label: 'Dracin',
      submenu: [
        { to: '/dracin-latest', label: 'Latest' },
        { to: '/dracin-popular', label: 'Popular' },
      ]
    },
    { to: '/genres', label: 'Genres' },
    { to: '/schedule', label: 'Schedule' },
    { to: '/history', label: 'History' },
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
          {navLinks.map((link, idx) => {
            if (link.submenu) {
              return (
                <div key={idx} className="nav-dropdown">
                  <span className="nav-link dropdown-trigger">
                    {link.label}
                    <span className="dropdown-arrow">▼</span>
                  </span>
                  <div className="dropdown-menu">
                    {link.submenu.map((sublink) => (
                      <Link
                        key={sublink.to}
                        to={sublink.to}
                        className={`dropdown-item ${location.pathname === sublink.to ? 'active' : ''}`}
                        onClick={closeMobileMenu}
                      >
                        {sublink.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }
            
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="nav-actions">
          <Link to="/search" className="btn btn-primary search-button" onClick={closeMobileMenu}>
            Cari
          </Link>
          
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
