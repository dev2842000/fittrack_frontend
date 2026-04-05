import { ImageResponse } from 'next/og';

// No edge runtime — generates as static file at build time for max chat app compatibility
export const alt = 'FitTrack — Workout Tracker & Progress Logger';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex' }} />

        {/* Logo */}
        <div style={{ fontSize: 72, marginBottom: 16, display: 'flex' }}>🏋️</div>

        {/* Title */}
        <div style={{ fontSize: 72, fontWeight: 900, color: 'white', letterSpacing: '-2px', display: 'flex' }}>
          FitTrack
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.85)', marginTop: 16, fontWeight: 500, display: 'flex' }}>
          Workout Tracker · Progress Logger · Personal Records
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 32, marginTop: 48 }}>
          {['📅 Log Workouts', '📈 Track Progress', '🏆 Hit PRs', '🎯 Weekly Goals'].map(item => (
            <div key={item} style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: 16,
              padding: '12px 24px',
              color: 'white',
              fontSize: 22,
              fontWeight: 600,
              display: 'flex',
            }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
