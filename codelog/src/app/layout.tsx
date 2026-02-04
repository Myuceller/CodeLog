import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CodeLog',
  description: 'AI 기술 블로그 초안 생성기',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
