import React, { createContext, useState, useRef, useEffect } from "react"
import { io } from "socket.io-client"
import Peer from "simple-peer"

const SocketContext = createContext<SocketContextType>({} as SocketContextType)

const socket = io(process.env.REACT_APP_HEROKU_API || "http://localhost:8000")

const ContextProvider = ({ children }: Props) => {
  const [stream, setStream] = useState<any>()
  const [myId, setMyId] = useState("")
  const [caller, setCaller] = useState<Caller>({})
  const [callAccepted, setCallAccepted] = useState(false)
  const [callEnded, setCallEnded] = useState(false)
  const [name, setName] = useState("")

  const myVideo = useRef<any>()
  const userVideo = useRef<any>()
  const connectionRef = useRef<any>()

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream)

      myVideo.current.srcObject = currentStream
    })

    socket.on("me", (id) => setMyId(id))

    socket.on("callUser", ({ from, name: callerName, signal }) => {
      setCaller({ isReceivingCall: true, id: from, name: callerName, signal })
    })
  }, [])

  const callUser = (id: string) => {
    const peer = new Peer({ initiator: true, trickle: false, stream })

    peer.on("signal", (data) => {
      socket.emit("callUser", { userToCall: id, signalData: data, from: myId, name })
    })

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream
    })

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true)
      peer.signal(signal)
    })

    connectionRef.current = peer
  }

  const answerCall = () => {
    setCallAccepted(true)

    const peer = new Peer({ initiator: false, trickle: false, stream })

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller.id })
    })

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream
    })

    peer.signal(caller.signal)

    connectionRef.current = peer
  }

  const leaveCall = () => {
    setCallEnded(true)

    connectionRef.current.destroy()

    window.location.reload()
  }

  return (
    // prettier-ignore
    <SocketContext.Provider value={{ caller, callAccepted, myVideo, userVideo, stream, name, setName, callEnded, myId, callUser, leaveCall, answerCall }}>
      {children}
    </SocketContext.Provider>
  )
}

interface Props {
  children: any
}
interface SocketContextType {
  caller: Caller
  callAccepted: boolean
  myVideo: any
  userVideo: any
  stream?: any
  name: string
  setName: (arg: string) => void
  callEnded: boolean
  myId: string
  callUser: (id: string) => void
  leaveCall: () => void
  answerCall: () => void
}
interface Caller {
  isReceivingCall?: boolean
  id?: string
  name?: string
  signal?: any
}

export { ContextProvider, SocketContext }
