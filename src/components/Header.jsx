import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => { setMobileMenuOpen(false); setOpenDropdown(null); };
  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const toggleDropdown = (label) => setOpenDropdown((prev) => (prev === label ? null : label));

  const navLinks = [
    { to: '/', label: 'Home' },
    { label: 'Anime', submenu: [
      { to: '/ongoing', label: 'Ongoing' },
      { to: '/completed', label: 'Completed' },
    ]},
    { label: 'Donghua', submenu: [
      { to: '/donghua-ongoing', label: 'Ongoing' },
      { to: '/donghua-completed', label: 'Completed' },
      { to: '/donghua-genres', label: 'Genres' },
      { to: '/donghua-az', label: 'A-Z List' },
    ]},
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
                const isOpen = openDropdown === link.label;
                return (
                  <div key={idx} className={`nav-dropdown ${isOpen ? 'open' : ''}`}>
                    <button
                      type="button"
                      className="nav-link dropdown-trigger"
                      onClick={() => toggleDropdown(link.label)}
                      aria-expanded={isOpen}
                    >
                      {link.label}
                      <span className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`}>▾</span>
                    </button>
                    <div className={`dropdown-menu ${isOpen ? 'show' : ''}`}>
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
            <Link to="/search" className="nav-search-link" onClick={closeMobileMenu} aria-label="Cari">
              🔍
            </Link>
            <button
              type="button"
              className={`mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`}
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            >
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </button>
          </div>
        </nav>
      </header>

      {mobileMenuOpen && (
        <div className="mobile-overlay open" onClick={closeMobileMenu} aria-hidden="true" />
      )}
    </>
  );
};

export default Header;
