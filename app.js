const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)


const publicDirectoryPath = path.join(__dirname, './public')
app.use(express.static(publicDirectoryPath))


// Body Parser
app.use(express.urlencoded({ extended: true }))
app.use(express.json());


io.on('connection', () => {
    console.log("New Websocket Connection")
})

// Listen On PORT
const PORT = process.env.PORT || 8000
server.listen(PORT, () => {
    console.log(`On Port: ${PORT}`)
})