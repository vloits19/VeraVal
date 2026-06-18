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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vera-val.fayq.my.id';

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
        {/* VeraVal SVG Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${baseUrl}/VeraValDark.svg`}
          height="140"
          style={{ marginBottom: 40 }}
          alt="VeraVal"
        />
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
