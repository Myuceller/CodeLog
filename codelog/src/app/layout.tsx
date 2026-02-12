import React from "react"
import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'CodeLog - 기술 블로그 자동 생성',
  description: 'CodeLog: AI 기반 기술 블로그 글 자동 생성 서비스',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
