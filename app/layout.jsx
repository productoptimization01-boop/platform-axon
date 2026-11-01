import { LiveSupportProvider } from './AllContext/ChatContext';
import GlobalSupportChat from './Common/SupportChat/GlobalSupportChat';
import { UsersProvider } from './AllContext/UsersContext';
import PresenceTracker from './Common/Presence/PresenceTracker';
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Axon</title>
      </head>
      <body>
        <UsersProvider><PresenceTracker /><LiveSupportProvider><GlobalSupportChat />{children}</LiveSupportProvider></UsersProvider>
      </body>
    </html>
  )
}

export const metadata = {
  generator: 'v0.dev'
};
