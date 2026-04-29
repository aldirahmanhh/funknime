import { useState, useRef, useCallback } from 'react';

/**
 * Enhanced iframe embed wrapper with:
 * - Loading skeleton before iframe loads
 * - Fullscreen button
 * - Theater mode toggle
 * - Click shield (blocks first click = ad redirect)
 * - Reload button
 */
const EmbedPlayer = ({ src, title, onLoad }) => {
  const [loaded, setLoaded] = useState(false);
  const [shieldActive, setShieldActive] = useState(true);
  const [theater, setTheater] = useState(false);
  const iframeRef = useRef(null);

  const handleLoad = useCallback(() => {
    setLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleShieldClick = () => {
    // First click disarms the shield, second click goes through to iframe
    setShieldActive(false);
  };

  const toggleFullscreen = () => {
    const el = iframeRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen?.() || el.webkitRequestFullscreen?.();
    }
  };

  const reloadIframe = () => {
    setLoaded(false);
    setShieldActive(true);
    const el = iframeRef.current;
    if (el) el.src = src;
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      background: '#000',
      borderRadius: 'inherit',
      overflow: 'hidden',
    }}>
      {/* Loading skeleton */}
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 5,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0a0a0f', gap: '12px',
        }}>
          <div style={{
            width: '44px', height: '44px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            Memuat player...
          </p>
        </div>
      )}

      {/* Ad click shield - blocks first click (usually ad redirect) */}
      {shieldActive && loaded && (
        <div
          onClick={handleShieldClick}
          style={{
            position: 'absolute', inset: 0, zIndex: 4,
            cursor: 'pointer',
          }}
        >
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            borderRadius: '50%',
            width: '64px', height: '64px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid rgba(255,255,255,0.2)',
            transition: 'transform 0.2s ease',
          }}>
            <span style={{ fontSize: '1.5rem', marginLeft: '4px', color: '#fff' }}>▶</span>
          </div>
          <div style={{
            position: 'absolute', bottom: '12px', left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.7)',
            padding: '4px 12px', borderRadius: '20px',
            fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)',
            whiteSpace: 'nowrap',
          }}>
            Klik untuk mulai menonton
          </div>
        </div>
      )}

      {/* Iframe */}
      <iframe
        ref={iframeRef}
        src={src}
        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        title={title}
        onLoad={handleLoad}
        style={{
          width: '100%', height: '100%',
          border: 'none',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Control bar */}
      {loaded && !shieldActive && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          display: 'flex', justifyContent: 'flex-end',
          gap: '4px', padding: '6px 8px',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          zIndex: 3, opacity: 0,
          transition: 'opacity 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
        onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
        >
          <ControlBtn icon="🔄" label="Reload" onClick={reloadIframe} />
          <ControlBtn icon="⛶" label="Fullscreen" onClick={toggleFullscreen} />
        </div>
      )}
    </div>
  );
};

const ControlBtn = ({ icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    style={{
      background: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '6px',
      color: '#fff',
      padding: '4px 8px',
      fontSize: '0.8rem',
      cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '4px',
      backdropFilter: 'blur(4px)',
      transition: 'background 0.15s ease',
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
  >
    {icon}
    <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{label}</span>
  </button>
);

export default EmbedPlayer;
