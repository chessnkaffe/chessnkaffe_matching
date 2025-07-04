export const metadata = {
  title: 'ChessnKaffe',
  description: 'Profile info',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
