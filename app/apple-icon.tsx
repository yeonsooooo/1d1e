import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
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
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: '-3px',
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
