import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Asset Analyses',
    template: '%s | Asset Analyses',
  },
  description: 'Property energy usage and vehicle tracking analyses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 font-sans antialiased">{children}</body>
    </html>
  );
}
