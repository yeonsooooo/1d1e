import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#000000',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: '#ffffff',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '-0.5px',
            fontFamily: 'sans-serif',
          }}
        >
          1d1e
        </span>
      </div>
    ),
    { ...size }
  )
}
