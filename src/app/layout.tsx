// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import { AuthProvider } from '@/components/Providers/AuthProvider';
import ClientLayout from '@/components/layout/ClientLayout';

const dmSans = DM_Sans({
  subsets: ['latin'],
  // You can add weight options if needed
  // weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'kcalculate AI - Intelligent Food Tracking & Nutrition Analysis',
  description: 'Track your nutrition with AI, get personalized diet recommendations, analyze food photos, and reach your health goals with our all-in-one nutrition tracking platform.',
  keywords: [
    'nutrition tracking',
    'food diary',
    'meal planner',
    'calorie counter',
    'macronutrient tracker',
    'diet planner',
    'health goals',
    'weight management',
    'AI food recognition',
    'nutrition analysis',
    'healthy eating',
    'fitness tracking',
    'personalized nutrition'
  ],

  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png' }
    ]
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="kcalculate" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={dmSans.className}>
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}