import fs from "node:fs/promises"
import vosk from "vosk"
import mic from "mic"

const sampleRate = process.env.SAMPLE_RATE ?? 16000
const modelPath = process.env.MODEL_PATH ?? "model"

try {
  await fs.access(modelPath, fs.constants.R_OK)
} catch {
  console.error("model not found")
  process.exit(1)
}

vosk.setLogLevel(-1)
const model = new vosk.Model(modelPath)
const rec = new vosk.Recognizer({ model, sampleRate })

const micInstance = mic({
  rate: String(sampleRate),
  debug: false,
})
const micStream = micInstance.getAudioStream()

micStream.on("data", data => {
  if (rec.acceptWaveform(data)) {
    console.log("accept")
    console.log(req.result())
  } else {
    console.log("partial")
    console.log(req.partialResult())
  }
})

micStream.on("audioProcessExitComplete", () => {
  console.log("bye")
  console.log(rec.finalResult())
  rec.free()
  model.free()
})

process.on("SIGINT", micInstance.stop)
micInstance.start()
