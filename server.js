const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');

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
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors()); // Use the cors middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
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
    io.emit('notification', { type: 'invoicePaid', message: `Invoice has been ${invoiceId} paid.` });
  });

  socket.on('invoiceUnpaid', (invoiceId) => {
  io.emit('notification', { type: 'invoiceUnpaid', message: `Invoice ${invoiceId} is unpaid.` });
});

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
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
