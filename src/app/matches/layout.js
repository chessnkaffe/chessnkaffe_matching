export const metadata = {
  title: 'ChessnKaffe - My Matches',
  description: 'View your chess matches',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}