import { Geist, Geist_Mono } from 'next/font/google'
import "./globals.css"
import { UsersProvider } from "./AllContext/UsersContext"
import { ChatProvider } from "./AllContext/ChatContext"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata = {
  title: "Axon - Premium Platform",
  description: "Your premium digital services platform",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased`}>
        <UsersProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </UsersProvider>
      </body>
    </html>
  )
}
