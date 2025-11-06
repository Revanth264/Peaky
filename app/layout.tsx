import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import 'intl-tel-input/build/css/intlTelInput.css'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins' 
})

export const metadata: Metadata = {
  title: 'Peakime Store - Premium Anime Merchandise',
  description: 'Shop the finest collection of anime merchandise, figures, apparel, and accessories at Peakime Store',
  keywords: ['anime', 'merchandise', 'figures', 'apparel', 'collectibles', 'peakime'],
  openGraph: {
    title: 'Peakime Store - Premium Anime Merchandise',
    description: 'Shop the finest collection of anime merchandise',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className={`font-sans antialiased ${inter.variable} ${poppins.variable}`}>
        <Providers>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
        <div
          id="recaptcha-container"
          style={{ position: 'fixed', left: '-9999px', bottom: 0, width: 1, height: 1, zIndex: 1, overflow: 'hidden' }}
        />
      </body>
    </html>
  )
}

