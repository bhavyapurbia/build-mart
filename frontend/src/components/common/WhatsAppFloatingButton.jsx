import React, { useState } from 'react';

const WhatsAppFloatingButton = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="bm-whatsapp-fixed-wrapper"
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '18px',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        pointerEvents: 'auto'
      }}
    >
      <a
        href="https://wa.me/919876543210?text=Hello%20BuildMart,%20I%20have%20an%20urgent%20construction%20materials%20requirement%20for%20my%20site"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-success)',
          boxShadow: '0 8px 24px rgba(37, 211, 102, 0.45), 0 2px 6px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: hovered ? 'scale(1.1) translateY(-2px)' : 'scale(1)',
          cursor: 'pointer',
          textDecoration: 'none'
        }}
      >
        {/* Official WhatsApp SVG Icon */}
        <svg
          viewBox="0 0 32 32"
          width="32"
          height="32"
          fill='var(--bg-card)'
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}
        >
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.664.743 5.158 2.034 7.29L2 30l6.892-2.004A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.64c-2.342 0-4.542-.67-6.408-1.83l-.46-.286-4.57 1.33 1.348-4.453-.3-.487A11.597 11.597 0 0 1 4.36 16c0-6.418 5.222-11.64 11.64-11.64 6.418 0 11.64 5.222 11.64 11.64 0 6.418-5.222 11.64-11.64 11.64zm6.388-8.736c-.35-.175-2.072-1.022-2.393-1.14-.321-.116-.554-.175-.788.175-.233.35-.904 1.14-1.108 1.373-.204.233-.408.263-.758.088-.35-.175-1.478-.545-2.815-1.738-1.04-.928-1.742-2.075-1.946-2.425-.204-.35-.022-.54.153-.714.158-.156.35-.408.525-.612.175-.204.233-.35.35-.583.116-.233.058-.437-.03-.612-.087-.175-.788-1.897-1.08-2.6-.283-.685-.572-.592-.788-.603l-.67-.012c-.233 0-.612.088-.933.437-.321.35-1.225 1.2-1.225 2.925 0 1.725 1.254 3.392 1.43 3.625.175.233 2.47 3.77 5.983 5.288.836.362 1.488.578 1.996.74.839.266 1.603.228 2.207.138.673-.1 2.072-.847 2.364-1.664.292-.817.292-1.517.204-1.664-.088-.146-.321-.233-.671-.408z" />
        </svg>

        {/* Online Indicator Green Dot */}
        <span
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '13px',
            height: '13px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-success)',
            border: '2px solid var(--bg-card)'
          }}
        />
      </a>

      {/* Floating Prompt Pill */}
      {hovered && (
        <div
          style={{
            backgroundColor: 'var(--color-ink)',
            color: 'var(--bg-card)',
            fontSize: '12px',
            fontWeight: 700,
            padding: '6px 12px',
            borderRadius: '20px',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            letterSpacing: '0.2px'
          }}
        >
          Chat on WhatsApp 💬
        </div>
      )}
    </div>
  );
};

export default WhatsAppFloatingButton;
