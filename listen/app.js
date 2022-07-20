"use strict"

import { access } from "node:fs/promises"
import { constants } from "node:fs"
import WebSocket, { WebSocketServer } from "ws"
import vosk from "vosk"
import mic from "mic"

const port = process.env.PORT || 8080
const sampleRate = process.env.SAMPLE_RATE || 16000
const modelPath = process.env.MODEL_PATH || "model"
try {
  await access(modelPath, constants.R_OK)
} catch {
  console.error("model not found")
  process.exit(1)
}

vosk.setLogLevel(-1)
const wss = new WebSocketServer({ port })
const model = new vosk.Model(modelPath)
const rec = new vosk.Recognizer({ model, sampleRate })
const micInstance = mic({
  rate: String(sampleRate),
  debug: false,
  device: "default",
})
const micStream = micInstance.getAudioStream()

micStream.on("data", data => {
  if (rec.acceptWaveform(data)) {
    const res = rec.result()
    if (res.text) {
      console.log(res)
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN)
          client.send(
            JSON.stringify({
              text: res.text,
              state: "accept",
            })
          )
      })
    }
  } else {
    const res = rec.partialResult()
    if (res.partial) {
      console.log(res)
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN)
          client.send(
            JSON.stringify({
              text: res.partial,
              state: "partial",
            })
          )
      })
    }
  }
})

micStream.on("audioProcessExitComplete", () => {
  console.log("bye")
  rec.free()
  model.free()
})

process.on("SIGINT", micInstance.stop)
micInstance.start()
