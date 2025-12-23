import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Bus, Users } from 'lucide-react';
import api from '../../api/config';

export default function Dashboard() {
  const [buses, setBuses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // 创建表单状态
  const [formData, setFormData] = useState({
    name: '', rows: 10, cols: 4, aislePos: '2', driverPos: 'left'
  });

  // 获取列表
  const fetchBuses = async () => {
    try {
      const res = await api.get('/buses');
      setBuses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchBuses(); }, []);

  // 提交创建
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        rows: Number(formData.rows),
        cols: Number(formData.cols),
        // 简单处理：将 "2" 转换为数组 [2]
        aisleCols: formData.aislePos === '-1' ? [] : [Number(formData.aislePos)]
      };
      await api.post('/buses', payload);
      setShowModal(false);
      fetchBuses(); // 刷新列表
    } catch (err) {
      alert('创建失败: ' + err.message);
    }
  };

  // 删除巴士 (简单实现)
  const handleDelete = async (id) => {
    if(!window.confirm('确定删除吗？')) return;
    // 这里需后端支持DELETE接口，暂未实现，仅做演示
    alert('删除功能需补充后端接口'); 
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">车次管理</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} className="mr-2" /> 新增巴士
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buses.map(bus => (
          <div key={bus._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                <Bus size={24} />
              </div>
              {/* 这里可以加删除按钮 */}
            </div>
            <h3 className="text-lg font-bold mb-1">{bus.name}</h3>
            <div className="text-sm text-slate-500 mb-4 flex items-center space-x-4">
              <span>{bus.rows}排 {bus.cols}列</span>
              {/* 计算预定数需后端返回或前端计算，此处暂略 */}
            </div>
            <Link 
              to={`/staff/bus/${bus._id}`} 
              className="block w-full py-2 bg-slate-50 text-slate-600 text-center rounded-lg hover:bg-blue-50 hover:text-blue-600 font-medium transition"
            >
              管理订座
            </Link>
          </div>
        ))}
      </div>

      {/* 创建模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">新增车辆</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">车牌/名称</label>
                <input required className="w-full p-2 border rounded" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">排数</label>
                  <input type="number" required className="w-full p-2 border rounded" value={formData.rows} onChange={e=>setFormData({...formData, rows: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">列数</label>
                  <input type="number" required className="w-full p-2 border rounded" value={formData.cols} onChange={e=>setFormData({...formData, cols: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">走廊位置 (第几列后)</label>
                <select className="w-full p-2 border rounded" value={formData.aislePos} onChange={e=>setFormData({...formData, aislePos: e.target.value})}>
                  <option value="0">第1列后</option>
                  <option value="1">第2列后</option>
                  <option value="2">第3列后 (标准2+2)</option>
                  <option value="3">第4列后</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">司机位置</label>
                <div className="flex space-x-4">
                  <label><input type="radio" name="dp" value="left" checked={formData.driverPos==='left'} onChange={()=>setFormData({...formData, driverPos:'left'})}/> 左侧</label>
                  <label><input type="radio" name="dp" value="right" checked={formData.driverPos==='right'} onChange={()=>setFormData({...formData, driverPos:'right'})}/> 右侧</label>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 text-slate-500">取消</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">创建</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
