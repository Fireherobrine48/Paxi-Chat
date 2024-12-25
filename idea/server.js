const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let connectedUsers = 0;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  const userIp = socket.handshake.address;
  console.log(`User connected from IP: ${userIp}`);
  connectedUsers++;
  io.emit('update_user_count', connectedUsers);

  socket.on('user_connected', (data) => {
    socket.username = data.username;
    socket.profilePicUrl = data.profilePicUrl;
    io.emit('message', { username: 'System', message: `${data.username} joined the chat`, profilePicUrl: 'https://cdn.pixabay.com/photo/2024/05/24/16/20/processor-8785387_640.jpg' });
  });

  socket.on('message', (data) => {
    io.emit('message', { username: data.username, message: data.message, profilePicUrl: data.profilePicUrl });
  });

  socket.on('image', (data) => {
    io.emit('message', { username: data.username, message: `<img src="${data.image}" alt="Image" style="max-width: 100%;">`, profilePicUrl: data.profilePicUrl });
  });

  socket.on('file', (data) => {
    io.emit('message', { username: data.username, message: `<a href="${data.fileData}" download="${data.fileName}">${data.fileName}</a>`, profilePicUrl: data.profilePicUrl });
  });

  socket.on('user_disconnected', (username) => {
    io.emit('message', { username: 'System', message: `${username} left the chat`, profilePicUrl: 'https://cdn.pixabay.com/photo/2024/05/24/16/20/processor-8785387_640.jpg' });
  });

  socket.on('disconnect', () => {
    connectedUsers--;
    io.emit('update_user_count', connectedUsers);
    if (socket.username) {
      io.emit('message', { username: 'System', message: `${socket.username} disconnected`, profilePicUrl: 'https://cdn.pixabay.com/photo/2024/05/24/16/20/processor-8785387_640.jpg' });
    }
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
