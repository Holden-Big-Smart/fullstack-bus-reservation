import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bus, ArrowRight } from 'lucide-react';
import api from '../../api/config';

export default function Home() {
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    api.get('/buses').then(res => setBuses(res.data));
  }, []);

  return (
    <div className="py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">开启您的舒适旅程</h1>
        <p className="text-slate-500">实时选座 · 透明预定 · 安全出行</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {buses.map(bus => (
          <div key={bus._id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <Bus size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">{bus.name}</h3>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">正在售票</span>
              </div>
            </div>
            
            <Link 
              to={`/bus/${bus._id}`} 
              className="flex items-center justify-center w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              去选座 <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}