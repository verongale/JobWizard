import { Outfit, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import Sidebar from './Sidebar'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata = {
  title: 'JobWizard',
  description: 'Trova aziende tech nascoste e traccia le tue candidature',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it" className={`${outfit.variable} ${cormorant.variable}`}>
      <body>
        <Sidebar />
        <div className="xl:ml-60">
          {children}
        </div>
      </body>
    </html>
  )
}