const express = require('express');
const http = require('http');
const ejs = require('ejs');
const socketIo = require('socket.io');
const fileUpload = require('express-fileupload');
const app = express();
const server = http.createServer(app);
const io = socketIo(server,{maxHttpBufferSize: 1e8});

app.use(express.static('public')); // Serve static files (e.g., CSS, JavaScript)
app.set('view engine', 'ejs'); // Set EJS as the view engine
app.use(fileUpload()); // Enable file uploads

app.get('/', (req, res) => {
  res.render('index');
});

io.on('connection', (socket) => {
    console.log('A user connected');
  
    // Handle room creation
    socket.on('create-room', (roomName) => {
      socket.join(roomName);
      console.log(`User joined room: ${roomName}`);
    });
  
    // Handle joining a room
    socket.on('join-room', (roomName) => {
      socket.join(roomName);
      console.log(`User joined room: ${roomName}`);
    });
  
    // Handle messages within a room
    socket.on('room-message', (data) => {
        socket.broadcast.to(data.room).emit('room-message', data.message);
    });

      // Handle file uploads within a room
  socket.on('file-upload', (data) => {
    console.log(`Received file: ${data.name}`);
    // Broadcast the file data to all users in the room
    socket.broadcast.to(data.room).emit('file-received', data)
    // io.to(data.room).emit('file-received', data);
  });
  
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

server.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on http://localhost:3000');
});
