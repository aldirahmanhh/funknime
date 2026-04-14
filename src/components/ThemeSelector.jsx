import { useState, useEffect } from 'react';

const THEMES = [
  { id: 'dark', icon: '🌙', label: 'Dark' },
  { id: 'minimal', icon: '✨', label: 'Minimal' },
  { id: 'neobrutalism', icon: '🎨', label: 'Neobrutalism' },
];

const ThemeSelector = () => {
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [isOpen, setIsOpen] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('funknime-theme') || 'dark';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const changeTheme = (themeId) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('funknime-theme', themeId);
    setIsOpen(false);
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const currentThemeData = THEMES.find(t => t.id === currentTheme);

  return (
    <div className={`theme-selector ${!isOpen ? 'collapsed' : ''}`}>
      <button
        className="theme-toggle-btn"
        onClick={toggleOpen}
        aria-label="Toggle theme selector"
        title="Change theme"
      >
        {currentThemeData?.icon || '🎨'}
      </button>
      
      {isOpen && THEMES.map(theme => (
        <button
          key={theme.id}
          className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
          onClick={() => changeTheme(theme.id)}
          data-theme={theme.id}
          aria-label={`Switch to ${theme.label} theme`}
          title={theme.label}
        >
          {theme.icon}
        </button>
      ))}
    </div>
  );
};

export default ThemeSelector;
