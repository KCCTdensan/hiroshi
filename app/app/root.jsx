import { useEffect, useState } from "react"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"
import io from "socket.io-client"
import { Socket } from "~/context"

export const meta = () => ({
  charset: "utf-8",
  title: "Hiroshi",
  viewport: "width=device-width,initial-scale=1",
})

export default function App() {
  const [socket, setSocket] = useState()

  useEffect(() => {
    const socket = io()
    setSocket(socket)
    return socket.close
  }, [])

  return (
    <html lang='ja'>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Socket socket={socket}>
          <Outlet />
        </Socket>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
