const socket = io()

// Elements
const messageForm = document.getElementById('message-form')
const messageFormInput = messageForm.querySelector('input')
const messageFormButton = messageForm.querySelector('button')
const sendLocationButton = document.getElementById('send-location')
const messages = document.getElementById('messages')
const sidebar = document.getElementById('sidebar')
// Templates
const messageTemplate = document.getElementById('message-template').innerHTML
const locationMessageTemplate = document.getElementById('location-message-template').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    // New Message element
    const newMessage = messages.lastElementChild

    // Height of new Message
    const newMessageStyle = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    // Visible Height
    const visibleHeight = messages.offsetHeight

    // Height of Messages Container
    const containerHeight = messages.scrollHeight

    // How far have i scrolled ?
    const scrollOffSet = messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffSet) {
        messages.scrollTop = messages.scrollHeight
    }

}

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (message) => {
    console.log(message);
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })

    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    sidebar.innerHTML = html
})

messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // disable
    messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {

        // enable
        messageFormButton.removeAttribute('disabled')
        messageFormInput.value = ''
        messageFormInput.focus()

        if (error) {
            return console.log(error);
        }

        console.log('Message Delivered');
    })
})


sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    // disable
    sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {

            // enable
            sendLocationButton.removeAttribute('disabled')

            console.log('Location Shared');
        })
    })


})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})