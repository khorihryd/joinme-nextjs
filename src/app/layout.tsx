import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { ToastProvider } from '@/components/ui/Toast';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'JoinMe — Undangan Digital Elegan & Modern',
  description: 'Buat website undangan digital pernikahan, ulang tahun, syukuran & bisnis secara cepat dengan RSVP otomatis & musik.',
  keywords: ['undangan digital', 'wedding invitation', 'rsvp digital', 'undangan pernikahan', 'joinme'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      data-theme="light"
      className={`${plusJakartaSans.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <SessionProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
