 // server.js
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const socketIo = require('socket.io')
const contactRoutes = require('./routes/contacts');
const Message = require('./models/Message');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/user');
const otpRoute = require('./routes/otpRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.get('/api/auth/test', (req, res) => {
  res.send("Hello from Node.js backend!");
});
app.use('/api/contacts', contactRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/auth', otpRoute);

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
  
  // Simpan data user di socket
  socket.userId = null;
  socket.userRooms = new Set();

  // Event untuk join room dengan validasi
  socket.on('joinRoom', (data) => {
    try {
      let userId, roomId;
      
      // Handle jika data berupa string atau object
      if (typeof data === 'string') {
        userId = data;
        roomId = data; 
      } else if (typeof data === 'object') {
        userId = data.userId;
        roomId = data.roomId || data.userId;
      }
      
      if (!userId) {
        socket.emit('joinRoomError', { message: 'UserId is required' });
        return;
      }
      
      // Keluar dari room sebelumnya jika ada
      if (socket.userId && socket.userRooms.has(socket.userId)) {
        socket.leave(socket.userId);
        socket.userRooms.delete(socket.userId);
        console.log(`User ${socket.userId} left previous room`);
      }
      
      // Join room baru
      socket.join(roomId);
      socket.userId = userId;
      socket.userRooms.add(roomId);
      
      console.log(`User ${userId} joined room: ${roomId}`);
      console.log(`Active rooms for socket ${socket.id}:`, Array.from(socket.rooms));
      
      // Konfirmasi ke client yang join
      socket.emit('joinRoomSuccess', { 
        userId: userId, 
        roomId: roomId,
        message: 'Successfully joined room' 
      });
      
      // Broadcast ke user lain di room (opsional)
      socket.to(roomId).emit('userJoinedRoom', { 
        userId: userId, 
        roomId: roomId 
      });
      
    } catch (error) {
      console.error('Error in joinRoom:', error);
      socket.emit('joinRoomError', { message: 'Failed to join room' });
    }
  });

  // Event untuk private message dengan validasi
  socket.on('PrivateMessage', (data) => {
    try {
      console.log('Pesan private diterima:', data);
      const { to, message } = data;
      const from = socket.userId;
      
      if (!to || !message) {
        socket.emit('messageError', { message: 'Invalid message data' });
        return;
      }

      const timestamp = new Date();

      const savedMessage = Message.create({
        from,
        to,
        message,
        timestamp
      });  

      // Tambahkan info pengirim
      const messageData = {
        from,
        to,
        message,
        timestamp: timestamp.toISOString(),
        messageId: savedMessage._id, 
      };
      
      // Kirim ke target user
      io.to(data.to).emit('PrivateMessage', messageData);
      
      // Konfirmasi ke pengirim
      socket.emit('messageSent', { 
        messageId: messageData.messageId,
        to: data.to 
      });
      
      console.log(`Private message sent from ${messageData.from} to ${data.to}`);
      
    } catch (error) {
      console.error('Error in PrivateMessage:', error);
      socket.emit('messageError', { message: 'Failed to send message' });
    }
  });

  // Event untuk broadcast message
  socket.on('sendMessage', (data) => {
    try {
      console.log('Pesan broadcast diterima:', data);
      
      const messageData = {
        ...data,
        from: socket.userId || socket.id,
        timestamp: new Date().toISOString(),
        messageId: Date.now() + Math.random()
      };
      
      // Broadcast ke semua user
      io.emit('receiveMessage', messageData);
      
      console.log(`Broadcast message sent by ${messageData.from}`);
      
    } catch (error) {
      console.error('Error in sendMessage:', error);
      socket.emit('messageError', { message: 'Failed to send broadcast message' });
    }
  });
  
  // Event untuk leave room
  socket.on('leaveRoom', (roomId) => {
    try {
      socket.leave(roomId);
      socket.userRooms.delete(roomId);
      console.log(`User ${socket.userId} left room: ${roomId}`);
      
      socket.emit('leaveRoomSuccess', { roomId });
      socket.to(roomId).emit('userLeftRoom', { 
        userId: socket.userId, 
        roomId 
      });
      
    } catch (error) {
      console.error('Error in leaveRoom:', error);
    }
  });
  
  // Event untuk get room info
  socket.on('getRoomInfo', (roomId) => {
    try {
      const room = io.sockets.adapter.rooms.get(roomId);
      const userCount = room ? room.size : 0;
      
      socket.emit('roomInfo', {
        roomId,
        userCount,
        users: room ? Array.from(room) : []
      });
      
    } catch (error) {
      console.error('Error getting room info:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.userId && socket.userRooms.size > 0) {
      // Notify semua room bahwa user disconnect
      socket.userRooms.forEach(roomId => {
        socket.to(roomId).emit('userDisconnected', { 
          userId: socket.userId,
          roomId: roomId 
        });
      });
    }
  });
  
  // Handle connection error
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

io.use((socket, next) => {
  console.log('New connection attempt:', {
    id: socket.id,
    handshake: socket.handshake.headers
  });
  next();
});