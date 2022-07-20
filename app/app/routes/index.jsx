import { useEffect, useState } from "react"
import { useSocket } from "~/context"

export default function Index() {
  const socket = useSocket()
  const [voice, setVoice] = useState("")
  const [state, setState] = useState("standby") // standby | listening

  useEffect(() => {
    if (!socket) return
    let updated = Date.now()
    let listening = false // 💩
    socket.on("voice", text => {
      setVoice(text)
      updated = Date.now()
      setTimeout(() => {
        if (!listening && Date.now() - updated >= 1000) setVoice("")
      }, 2000)
    })
    socket.on("listen", () => {
      listening = true
      setState("listening")
    })
    socket.on("success", msg => {
      listening = false
      setState("success")
      setVoice("")
      console.log(msg) //
      setTimeout(() => {
        if (!listening) setState("standby")
      }, 3000)
    })
    socket.on("abort", msg => {
      listening = false
      setState("abort")
      setVoice("")
      console.log(msg) //
      setTimeout(() => {
        if (!listening) setState("standby")
      }, 3000)
    })
  }, [socket])

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Hiroshi</h1>
      <i>{voice || "何か話してみてください……"}</i>
      <ul>
        <li>state: {state}</li>
      </ul>
    </div>
  )
}
