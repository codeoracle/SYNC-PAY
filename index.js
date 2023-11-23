const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require("cors");
const bodyParser = require('body-parser')
// const paymentRoutes = require('./routes/paymentRoutes')
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes')
const clientRoutes = require('./routes/clientRoutes')
const productRoutes = require('./routes/productRoutes')
const passwordResetController = require('./controllers/passwordResetController');


dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(bodyParser.json())
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

app.use('/auth', authRoutes);
app.use('/auth', passwordResetController);
app.use('/api', dashboardRoutes);
app.use('/api', clientRoutes);
app.use('/api', productRoutes);
// app.use('/payments', paymentRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});