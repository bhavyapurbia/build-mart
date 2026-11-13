import React from 'react';

export default function RouteLoadingSkeleton() {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 16px',
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Top Banner Skeleton */}
      <div style={{
        height: '140px',
        backgroundColor: '#F3F4F6',
        borderRadius: '12px',
        animation: 'pulse 1.5s infinite ease-in-out'
      }} />

      {/* Grid Skeleton */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '20px'
      }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{
            height: '280px',
            backgroundColor: '#F9FAFB',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'pulse 1.5s infinite ease-in-out'
          }}>
            <div style={{ flex: 1, backgroundColor: '#E5E7EB', borderRadius: '8px' }} />
            <div style={{ height: '16px', width: '60%', backgroundColor: '#E5E7EB', borderRadius: '4px' }} />
            <div style={{ height: '20px', width: '40%', backgroundColor: '#E5E7EB', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

