import { ImageResponse } from 'next/og';

// Static generation at build time
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #22c55e, #10b981)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          fontWeight: 900,
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        F
      </div>
    ),
    size,
  );
}
