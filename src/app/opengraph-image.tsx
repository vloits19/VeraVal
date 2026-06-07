import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const alt = 'VeraVal - Track Your Anime Journey';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          background: '#0B0D17', // VeraVal Dark Background
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* VeraVal Text Logo */}
        <div
          style={{
            fontSize: 120,
            fontWeight: 'bold',
            color: '#FFFFFF',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span style={{ color: '#E85D75' }}>Vera</span>
          <span style={{ color: '#FFFFFF' }}>Val</span>
        </div>
        <div
          style={{
            fontSize: 48,
            color: '#A0AEC0',
            textAlign: 'center',
            maxWidth: '80%',
          }}
        >
          Track, discover, and enjoy anime your way.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
