import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Meta Ad Spy — DTC Intelligence Platform',
  description: 'Spy on top-performing Meta ads from 50+ DTC brands. Sorted by impressions, analyzed by AI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gray-950">{children}</body>
    </html>
  );
}
