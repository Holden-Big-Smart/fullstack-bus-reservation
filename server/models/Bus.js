const mongoose = require('mongoose');

// 乘客订座信息子结构
const bookingSchema = new mongoose.Schema({
  seatId: String,      // 例如 "0-0" 代表第1排A座
  name: String,        // 乘客姓名
  phone: String,       // 电话
  gender: String,
  age: Number,
  remark: String,
  status: { 
    type: String, 
    enum: ['reserved', 'confirmed'], // 仅预定 vs 已确认(已付)
    default: 'reserved' 
  },
  handledBy: String,   // 经办员工姓名
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

// 巴士主结构
const busSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 车牌或班次名
  rows: { type: Number, required: true }, // 总排数
  cols: { type: Number, required: true }, // 总列数
  aisleCols: [Number],    // 走廊位置 (例如 [2] 表示第2列后面是走廊)
  driverPos: {            // 司机位置
    type: String, 
    enum: ['left', 'right'], 
    default: 'left' 
  },
  doors: [String],        // 安全出口/后门的座位ID列表 (例如 ["4-2"])
  bookings: {             // 订座记录：key是座位ID，value是乘客信息
    type: Map,
    of: bookingSchema,
    default: {}
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bus', busSchema);
