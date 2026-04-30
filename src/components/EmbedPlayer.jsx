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
  const iframeRef = useRef(null);

  const handleLoad = useCallback(() => {
    setLoaded(true);
    onLoad?.();
  }, [onLoad]);

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

      {/* Iframe — no shield, user interacts directly with embed controls */}
      <iframe
        ref={iframeRef}
        src={src}
        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups allow-popups-to-escape-sandbox"
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

      {/* Top-right control buttons — small, doesn't block embed controls */}
      {loaded && (
        <div style={{
          position: 'absolute', top: '6px', right: '6px',
          display: 'flex', gap: '4px',
          zIndex: 3, opacity: 0,
          transition: 'opacity 0.2s ease',
          pointerEvents: 'none',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.pointerEvents = 'auto'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = 0; e.currentTarget.style.pointerEvents = 'none'; }}
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
