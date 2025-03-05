import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Import components
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Initialize font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'NutriTrack - Smart Food Tracking',
  description: 'Track your nutrition with AI-powered food recognition',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gray-50">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}