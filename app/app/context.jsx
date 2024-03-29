import { createContext, useContext } from "react"

const context = createContext(undefined)

export function useSocket() {
  return useContext(context)
}

export function Socket({ socket, children }) {
  return <context.Provider value={socket}>{children}</context.Provider>
}
