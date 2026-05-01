import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/components/auth-provider'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1C1C1E',
}

export const metadata: Metadata = {
  title: '1d1e — One Day, One Emoji',
  description: 'A minimal dark-mode emoji diary. Capture each day with a single emoji.',
  openGraph: {
    title: '1d1e — One Day, One Emoji',
    description: 'A minimal dark-mode emoji diary. Capture each day with a single emoji.',
    images: [{ url: '/og_image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og_image.png'],
  },
  appleWebApp: {
    capable: true,
    title: '1d1e',
    statusBarStyle: 'black-translucent',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css" />
      </head>
      <body className="font-sans antialiased bg-[#1C1C1E]">
        <AuthProvider>
          {children}
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
