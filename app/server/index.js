"use strict"
// https://github.com/remix-run/remix/blob/eafad35/examples/socket.io

const path = require("node:path")
const fs = require("node:fs")
const { createServer } = require("node:http")
const { Server } = require("socket.io")
const express = require("express")
const compression = require("compression")
const WebSocket = require("ws")
const { createRequestHandler } = require("@remix-run/express")
const pattern = require("./pattern")

const port = process.env.PORT || 3000
const listenHost = process.env.LISTEN_HOST || "localhost:8080"
const mode = process.env.NODE_ENV
const buildDir = path.join(process.cwd(), "server/build")

try {
  fs.accessSync(buildDir)
} catch {
  console.warn("Please run `npm run dev` or `npm run build` before.")
  process.exit(1)
}

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)
const ws = new WebSocket(`ws://${listenHost}`)

app.use(compression())
app.use(express.static("public", { maxAge: "1h" }))
app.use(express.static("public/build", { immutable: true, maxAge: "1y" }))
app.all(
  "*",
  mode === "production"
    ? createRequestHandler({ build: require("./build") })
    : (req, res, next) => {
        for (const key in require.cache)
          if (key.startsWith(buildDir)) delete require.cache[key]
        const build = require("./build")
        return createRequestHandler({ build, mode })(req, res, next)
      }
)

ws.on("message", data => handler(JSON.parse(data)))

httpServer.listen(port, () => {
  console.log(`Express server listening on port ${port}`)
})

function handler(data) {
  if (data.state === "partial") {
    const text = data.text.split(/\s+/).join("")
    io.sockets.emit("voice", text)
    if (pattern.detect.test(text)) io.sockets.emit("listen")
  } else if (data.state === "accept") {
    const text = data.text.split(/\s+/).join("")
    io.sockets.emit("voice", text)
    switch (true) {
      default: {
        io.sockets.emit("abort", "理解できませんでした．")
      }
    }
  }
}
