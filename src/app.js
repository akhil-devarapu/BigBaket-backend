const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
const db = require('../src/config/database');
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Example route
app.get('/', (req, res) => {
  res.send('BigBasket API is running');
});



//apis start
const authRoutes = require('./Routes/authRoutes');
app.use('/api/auth', authRoutes);
const userRoutes = require('./Routes/userRoutes');
app.use('/api/users', userRoutes);
const productRoutes = require('./Routes/productRoutes');
app.use('/api', productRoutes);
const cartRoutes = require('./Routes/cartRoutes');
app.use('/api', cartRoutes);
const orderRoutes = require('./Routes/orderRoutes');
app.use('/api', orderRoutes);
const paymentRoutes=require('./Routes/paymentRoutes');
app.use('/api',paymentRoutes);
const cuponRoutes=require('./Routes/cuponRoutes');
app.use('/api',cuponRoutes);
const adminRoutes= require('./Routes/adminRoutes');
app.use('/api',adminRoutes);
const deliveryRoutes = require('./Routes/deliveryRoutes');
app.use('/api', deliveryRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
