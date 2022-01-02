const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server)


const publicDirectoryPath = path.join(__dirname, './public')
app.use(express.static(publicDirectoryPath))


// Body Parser
app.use(express.urlencoded({ extended: true }))
app.use(express.json());


io.on('connection', (socket) => {
    console.log("New Websocket Connection")

    socket.emit('message', "Welcome!")
    socket.broadcast.emit('message', 'A user has joined')

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }

        io.emit('message', message)
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {

        io.emit('locationMessage', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
        callback()
    })


    socket.on('disconnect', () => {
        io.emit('message', 'A user has left!')
    })


})

// Listen On PORT
const PORT = process.env.PORT || 8000
server.listen(PORT, () => {
    console.log(`On Port: ${PORT}`)
})