import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="text-center py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">欢迎使用巴士订座系统</h1>
      <p className="text-gray-600 mb-8">请选择您要乘坐的班次</p>
      
      <div className="grid gap-4 md:grid-cols-3">
        {/* 模拟一个巴士卡片 */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <h3 className="text-xl font-bold mb-2">粤B-88888</h3>
          <p className="text-gray-500 mb-4">发车时间: 10:00</p>
          <Link to="/bus/1" className="block w-full py-2 bg-blue-600 text-white rounded text-center">
            点击选座
          </Link>
        </div>
      </div>
      
      <div className="mt-10 pt-10 border-t">
        <Link to="/staff/login" className="text-sm text-blue-500 underline">
          我是员工，前往后台登录
        </Link>
      </div>
    </div>
  );
}