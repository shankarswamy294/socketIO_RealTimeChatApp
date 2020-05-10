const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users')

// get username and room from url
const {username, room} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
});

console.log(username, room);


const socket = io();
// join chatroom
socket.emit('joinRoom', {username, room})

// get room and users
socket.on('roomUsers', ({room, users})=>{
    console.log("==>,", room);
    outputRoomName(room);
    outputUsersName(users);
});

// message from server
socket.on('message',message=>{
    outputMessage(message);
    console.log(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const msg = e.target.elements.msg.value;

    // emit message to server
    socket.emit('chatMessage', msg)

    // clear input
    e.target.elements.msg.value = '';

});


// op message to DOM

const outputMessage = (message) => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`
    document.querySelector('.chat-messages').appendChild(div);
}

const outputRoomName = (room) => {
    roomName.innerText = room;
}

const outputUsersName = (users) => {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}