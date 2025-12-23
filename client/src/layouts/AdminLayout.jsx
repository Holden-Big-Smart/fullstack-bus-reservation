import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/staff/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* 侧边栏 */}
      <aside className="w-64 bg-slate-800 text-white p-6 hidden md:block">
        <div className="text-2xl font-bold mb-8">管理后台</div>
        <nav className="space-y-2">
          <Link to="/staff/dashboard" className="block py-2 px-4 bg-slate-700 rounded">巴士管理</Link>
        </nav>
      </aside>
      
      {/* 主内容 */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white h-16 shadow-sm flex items-center justify-between px-6">
          <div className="font-bold">控制台</div>
          <button onClick={handleLogout} className="text-red-500 text-sm">退出登录</button>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}