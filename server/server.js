import express from 'express'
import http from 'node:http'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Server } from 'socket.io'
import cors from 'cors'

import { registerPokerHandlers, registerDisconnectHandler } from './poker.js'
import {
  registerRetroHandlers,
  ensureRetroState,
  broadcastBoard,
  broadcastTimer,
  cleanupRetroTimerIfRoomEmpty,
} from './retro.js'

const app = express()

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  }),
)

app.get('/health', (req, res) => {
  res.sendStatus(200)
})

// The combined image (root Dockerfile, e.g. Render) bundles the built client;
// the standalone backend image (AWS) does not, so serve it only when present.
const clientDist = fileURLToPath(new URL('../client/dist/', import.meta.url))

if (existsSync(join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist))
  app.get('/{*path}', (req, res) => {
    res.sendFile(join(clientDist, 'index.html'))
  })
} else {
  app.get('/', (req, res) => {
    res.status(200).send('Tools Platform backend is running')
  })
}

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Every room always supports both tools, so whenever a room is created or
  // joined we make sure retro state exists and push the current snapshot.
  const syncRetroState = (roomId) => {
    ensureRetroState(roomId)
    broadcastBoard(io, roomId)
    broadcastTimer(io, roomId)
  }

  registerPokerHandlers(io, socket, {
    onRoomCreated: syncRetroState,
    onRoomJoined: syncRetroState,
  })

  registerRetroHandlers(io, socket)

  registerDisconnectHandler(io, socket, {
    onParticipantLeft: cleanupRetroTimerIfRoomEmpty,
  })
})

const PORT = process.env.PORT ?? 8000
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
