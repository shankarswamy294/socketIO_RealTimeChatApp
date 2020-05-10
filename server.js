const path = require('path')
const http = require('http')
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

const app =express();
const server = http.createServer(app)
const io = socketio(server);

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = "shanki-bot"

// runs when user connects
io.on('connection', socket => {
    socket.on('joinRoom',({username, room})=>{
    
    const user=userJoin(socket.id, username, room);

    // join is socket io property where it adds client to room
    socket.join(user.room)
        // when user connects
    socket.emit('message', formatMessage(botName, 'Welcome to Chat!'));

    // broadcast when user connects
    // .to() is used to broadcast to specfic room
    // socket.broadcast.to(user.room).emit('message', formatMessage(botName, 'A user has jpined a chat'));
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined a chat`));
    
    // send users to room
    io.to(user.room).emit('roomUsers',{
        room: user.room,
        users: getRoomUsers(user.room)
    })
});

    // Emit message to server
    socket.on('chatMessage', (msg)=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg))      
    });
     //  when clien disconnects
     socket.on('disconnect', ()=>{
         const user=userLeave(socket.id);
         console.log(user);
         if(user){
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`)); 
            
            // send users to room
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        })
            }
        });
});


const PORT= process.env.PORT || 3000;

server.listen(PORT, ()=>{console.log(`server running on ${PORT}`)})
