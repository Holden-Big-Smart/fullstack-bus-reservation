import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // 模拟登录成功，存一个假的 token
    localStorage.setItem('token', 'demo-token');
    alert('登录成功！');
    navigate('/staff/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">员工登录</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">用户名</label>
            <input type="text" className="w-full p-2 border rounded" placeholder="admin" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">密码</label>
            <input type="password" className="w-full p-2 border rounded" placeholder="123456" />
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded font-bold">
            登录
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:underline">返回客户首页</Link>
        </div>
      </div>
    </div>
  );
}
