import './globals.css'

export const metadata = {
  title: 'Dynamic Scheduling AI',
  description: 'Intelligent task assignment powered by AI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 