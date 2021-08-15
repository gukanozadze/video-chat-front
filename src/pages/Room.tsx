import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { io } from "socket.io-client"
import Peer from "simple-peer"

const Room = () => {
  const { room } = useParams<{ room: string }>()
  const socket = io(process.env.REACT_APP_HEROKU_API || "http://localhost:8000")
  const [myId, setMyId] = useState("")

  useEffect(() => {
    socket.on("user-connected", (userId) => {
      console.log("userConnecetd:", userId)
    })

    socket.on("room", (id) => {
      if (id) {
        socket.emit("join-room", { roomId: room, userId: id })
        setMyId(id)
      }
    })
  }, [])

  if (!myId) return null

  return (
    <div className="text-white">
      <video />
    </div>
  )
}

export default Room
