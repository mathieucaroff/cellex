import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cellex",
  description: "Unidimensional Cellular Automaton Explorer",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="bodyDiv">
          <div id="appRoot">{children}</div>
        </div>
      </body>
    </html>
  )
}
