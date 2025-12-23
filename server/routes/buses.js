const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');

// GET /api/buses - 获取所有巴士列表
router.get('/', async (req, res) => {
  try {
    const buses = await Bus.find().sort({ createdAt: -1 });
    res.json(buses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/buses/:id - 获取单辆巴士详情 (用于选座页)
router.get('/:id', async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ message: 'Bus not found' });
    res.json(bus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/buses - 创建新巴士 (员工端)
router.post('/', async (req, res) => {
  const bus = new Bus({
    name: req.body.name,
    rows: req.body.rows,
    cols: req.body.cols,
    aisleCols: req.body.aisleCols || [],
    driverPos: req.body.driverPos || 'left'
  });

  try {
    const newBus = await bus.save();
    res.status(201).json(newBus);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/buses/:id/seat - 更新座位预定状态 (核心逻辑)
router.put('/:id/seat', async (req, res) => {
  const { seatId, passengerData } = req.body; 
  // passengerData 为 null 时代表取消预定

  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ message: 'Bus not found' });

    if (passengerData === null) {
      // 取消预定
      bus.bookings.delete(seatId);
    } else {
      // 新增或修改预定
      bus.bookings.set(seatId, passengerData);
    }

    // 这一步很重要：由于 Map 类型在 Mongoose 中检测变化较特殊，有时需手动标记
    bus.markModified('bookings'); 
    await bus.save();
    
    res.json(bus);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/buses/:id/door - 设置/取消安全出口
router.put('/:id/door', async (req, res) => {
  const { seatId } = req.body;
  try {
    const bus = await Bus.findById(req.params.id);
    const index = bus.doors.indexOf(seatId);
    
    if (index > -1) {
      bus.doors.splice(index, 1); // 移除门
    } else {
      bus.doors.push(seatId); // 设为门
      bus.bookings.delete(seatId); // 同时清除该位置的预定
    }
    
    await bus.save();
    res.json(bus);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
