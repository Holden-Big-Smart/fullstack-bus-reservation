import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages - Client
import ClientHome from './pages/client/Home';
import ClientBusView from './pages/client/BusDetail';

// Pages - Admin
import Login from './pages/admin/Login';
import Register from './pages/admin/Register';
import AdminDashboard from './pages/admin/Dashboard';
import AdminBusManage from './pages/admin/BusManage';

// 简单的路由保护组件
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // 假设登录后存了token
  if (!token) {
    return <Navigate to="/staff/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- 1. 客户展示端 (公开) --- */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<ClientHome />} />           {/* 巴士选择列表 */}
          <Route path="bus/:id" element={<ClientBusView />} /> {/* 实时座位展示 */}
        </Route>

        {/* --- 2. 员工后台端 (需要权限) --- */}
        
        {/* 2.1 认证页面 (不需要 AdminLayout) */}
        <Route path="/staff/login" element={<Login />} />
        <Route path="/staff/register" element={<Register />} />

        {/* 2.2 业务页面 (套用 AdminLayout) */}
        <Route path="/staff" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} /> {/* 创建巴士/列表 */}
          <Route path="bus/:id" element={<AdminBusManage />} />   {/* 订座操作页 */}
        </Route>

        {/* 404 */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
