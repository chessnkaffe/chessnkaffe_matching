export const metadata = {
  title: 'ChessnKaffe - Find Chess Partners',
  description: 'Find chess partners near you',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}