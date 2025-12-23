import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Bus } from 'lucide-react';

export default function ClientLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-blue-600 font-bold text-xl">
            <Bus />
            <span>畅行巴士</span>
          </Link>
          <div className="text-sm text-gray-500">客户预定端</div>
        </div>
      </nav>

      {/* 页面内容占位符 */}
      <main className="max-w-6xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
