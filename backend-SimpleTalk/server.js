 // server.js
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const socketIo = require('socket.io')

dotenv.config();

const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json()); 
app.use('/api/auth', authRoutes);
app.get('/api/auth/test', (req, res) => {
  res.send("Hello from Node.js backend!");
});

const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Koneksi ke MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
console.log('✅ Server ready...');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

// Socket Io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`User joined room: ${userId}`);
  });

  socket.on('PrivateMessage', (data) => {
    console.log('Pesan private diterima:', data);
    io.to(data.to).emit('PrivateMessage', data);
  });

  socket.on('sendMessage', (data) => {
    console.log('Pesan diterima:', data);
    io.emit('receiveMessage', data); 
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});