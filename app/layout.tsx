import 'app/ui/global.css';
import { fustat } from '@/app/ui/fonts';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${fustat.className} antialiased`}>{children}</body>
    </html>
  );
}
