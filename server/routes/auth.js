const express = require('express');
const router = express.Router();

// 真正的登录逻辑需要 User 模型和 JWT，这里先做个简单的模拟
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  // 简单硬编码验证用于测试
  if (username === 'admin' && password === '123456') {
    res.json({ token: 'mock-jwt-token', user: { name: 'Admin Staff' } });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

module.exports = router;
