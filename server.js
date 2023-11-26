const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const http = require('http');
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],

  }
});

const authRoutes = require('./routes/authRoutes');
const businessOwner = require('./routes/businessOwner');
const clientController = require('./routes/clientController');
const clientRoutes = require('./routes/clientRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const productRoutes = require('./routes/productRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');

dotenv.config();
const PORT = process.env.PORT || 4000;
const app = express();
const httpServer = http.createServer(app);
const socketIo = io(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  }
});

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

// Socket.IO connection handling
socketIo.on('connection', (socket) => {
  console.log('A user connected');

  // Handle events related to invoices
  socket.on('invoicePaid', (invoiceId) => {
    socketIo.emit('notification', { type: 'invoicePaid', message: `Invoice has been ${invoiceId} paid.` });
  });

  socket.on('invoiceUnpaid', (invoiceId) => {
    socketIo.emit('notification', { type: 'invoiceUnpaid', message: `Invoice ${invoiceId} is unpaid.` });
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.use((req, res, next) => {
  req.io = socketIo;
  next();
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/auth', authRoutes);
app.use('/auth', businessOwner);
app.use('/api', clientController);
app.use('/api', clientRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', invoiceRoutes);
app.use('/api/notifications', notificationRoutes); 
app.use('/payments', paymentRoutes);
app.use('/api', productRoutes);
app.use('/auth', passwordResetRoutes);


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});