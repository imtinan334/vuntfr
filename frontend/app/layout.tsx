import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VU Datesheet Notifier - Never Miss Your Exam Schedule',
  description: 'Get instant email notifications when Virtual University announces your exam datesheet. Stay ahead of the game with automated monitoring.',
  keywords: 'VU, Virtual University, datesheet, exam schedule, notifications, students',
  authors: [{ name: 'VU Datesheet Notifier Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1E40AF',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'VU Datesheet Notifier',
    description: 'Never miss your VU exam datesheet announcements. Get instant notifications!',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VU Datesheet Notifier',
    description: 'Never miss your VU exam datesheet announcements. Get instant notifications!',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}