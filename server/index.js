const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. 中间件
app.use(cors());
app.use(express.json());

// 2. 连接 MongoDB (请确保本地 MongoDB 已启动或使用 Atlas URL)
// 这里的 URL 默认连接本地数据库 'bus-booking'
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bus-booking';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 3. 引入路由 (稍后创建)
const busRoutes = require('./routes/buses');
const authRoutes = require('./routes/auth'); // 预留给员工登录

app.use('/api/buses', busRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Bus Booking API is running...');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
