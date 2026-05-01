import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '1d1e — One Day, One Emoji',
    short_name: '1d1e',
    description: 'A minimal dark-mode emoji diary. Capture each day with a single emoji.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1C1C1E',
    theme_color: '#1C1C1E',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
