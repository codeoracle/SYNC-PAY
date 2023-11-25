const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');

const paymentRoutes = require('./routes/paymentRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const clientRoutes = require('./routes/clientRoutes');
const productRoutes = require('./routes/productRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const passwordResetController = require('./controllers/passwordResetController');
const notificationRoutes = require('./routes/notificationRoutes'); 

dotenv.config();
const PORT = process.env.PORT || 4000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, PUT, GET, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle events related to invoices
  socket.on('invoicePaid', (invoiceId) => {
    io.emit('notification', { type: 'invoicePaid', message: `Invoice ${invoiceId} has been paid.` });
  });

  socket.on('invoiceUnpaid', (invoiceId) => {
    io.emit('notification', { type: 'invoiceUnpaid', message: `Invoice ${invoiceId} is unpaid.` });
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Middleware to expose the 'io' instance to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/auth', authRoutes);
app.use('/auth', passwordResetController);
app.use('/api', dashboardRoutes);
app.use('/api', clientRoutes);
app.use('/api', productRoutes);
app.use('/api', invoiceRoutes);
app.use('/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes); 

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
