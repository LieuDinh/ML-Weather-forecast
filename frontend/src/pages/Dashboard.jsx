import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, CartesianGrid, Legend, Area, AreaChart 
} from 'recharts';
import { Trophy, Zap, TrendingUp, Activity, MapPin } from 'lucide-react';
import { weatherApi } from '../api/weatherApi';

// Danh sách các tỉnh chính xác từ dữ liệu Label Encoding của mô hình
export const PROVINCES = [
  { code: 0, name: 'Bạc Liêu' },
  { code: 1, name: 'Bến Tre' },
  { code: 2, name: 'Biên Hòa' },
  { code: 3, name: 'Buôn Ma Thuột' },
  { code: 4, name: 'Cà Mau' },
  { code: 5, name: 'Cẩm Phả' },
  { code: 6, name: 'Cam Ranh' },
  { code: 7, name: 'Cần Thơ' },
  { code: 8, name: 'Châu Đốc' },
  { code: 9, name: 'Đà Lạt' },
  { code: 10, name: 'Hà Nội' },
  { code: 11, name: 'Hải Dương' },
  { code: 12, name: 'Hải Phòng' },
  { code: 13, name: 'TP. Hồ Chí Minh' },
  { code: 14, name: 'Hòa Bình' },
  { code: 15, name: 'Hòn Gai' },
  { code: 16, name: 'Huế' },
  { code: 17, name: 'Long Xuyên' },
  { code: 18, name: 'Mỹ Tho' },
  { code: 19, name: 'Nam Định' },
  { code: 20, name: 'Nha Trang' },
  { code: 21, name: 'Phan Rang' },
  { code: 22, name: 'Phan Thiết' },
  { code: 23, name: 'Pleiku' },
  { code: 24, name: 'Quy Nhơn' },
  { code: 25, name: 'Rạch Giá' },
  { code: 26, name: 'Sóc Trăng' },
  { code: 27, name: 'Tam Kỳ' },
  { code: 28, name: 'Tân An' },
  { code: 29, name: 'Thái Nguyên' },
  { code: 30, name: 'Thanh Hóa' },
  { code: 31, name: 'Trà Vinh' },
  { code: 32, name: 'Tuy Hòa' },
  { code: 33, name: 'Uông Bí' },
  { code: 34, name: 'Việt Trì' },
  { code: 35, name: 'Vinh' },
  { code: 36, name: 'Vĩnh Long' },
  { code: 37, name: 'Vũng Tàu' },
  { code: 38, name: 'Yên Bái' }
].sort((a, b) => a.name.localeCompare(b.name)); // Tự động sắp xếp theo ABC cho người dùng dễ tìm

const stats = [
  { name: 'XGBoost', r2: 0.8111, color: '#10b981' }, 
  { name: 'LSTM', r2: 0.4466, color: '#3b82f6' },
  { name: 'Random Forest', r2: 0.3851, color: '#f59e0b' }, 
  { name: 'Prophet', r2: 0.0689, color: '#ef4444' },
];

const importance = [
  { name: 'wet_streak_days', val: 0.2852 }, 
  { name: 'wet_to_dry', val: 0.2178 },
  { name: 'consecutive_dry', val: 0.1833 }, 
  { name: 'rain_yesterday', val: 0.0769 },
];

const Dashboard = () => {
  const [chartData, setChartData] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(10); // Đổi mặc định sang 10 (Hà Nội)

  useEffect(() => {
    weatherApi.getPredictions(1, 30, selectedProvince)
      .then(res => setChartData(res.data.data.items)) 
      .catch(err => console.error(err));
  }, [selectedProvince]); 

  return (
    <div className="p-8 space-y-8 bg-[#f8fafc] min-h-screen text-slate-800">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 shadow-xl text-white flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <Trophy size={200} className="transform translate-x-10 -translate-y-10" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase shadow-lg shadow-emerald-500/30">Winner Model</span>
          </div>
          <h2 className="text-3xl font-black mt-2">Mô hình XGBoost (Pipeline V4)</h2>
          <p className="text-slate-300 font-medium mt-2 text-lg">Độ chính xác R²: <span className="text-emerald-400 font-bold">0.8111</span> | Sai số trung bình (MAE): <span className="text-emerald-400 font-bold">1.94 mm</span></p>
        </div>
      </div>

      {/* Biểu đồ đường (Tương tác được) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <Activity className="text-blue-500"/> Tracking bám sát (30 ngày đầu năm)
          </h3>
          
          {/* Dropdown chọn tỉnh */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
            <MapPin size={18} className="text-emerald-600"/>
            <select 
              className="bg-transparent border-none focus:ring-0 outline-none text-sm font-bold text-slate-700 cursor-pointer w-48"
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(parseInt(e.target.value))}
            >
              {PROVINCES.map(p => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorXgbDash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} minTickGap={30}/>
              <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} unit="mm" />
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}/>
              <Legend verticalAlign="top" height={36} iconType="circle"/>
              <Area type="monotone" name="Dự báo XGBoost" dataKey="predicted_rain_mm" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorXgbDash)" />
              <Line type="monotone" name="Thực tế" dataKey="actual_rain_mm" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={{r: 3, fill: '#64748b'}} activeDot={{r: 6}} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Cột số liệu nhỏ gọn */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><TrendingUp size={20} className="text-emerald-500"/> So sánh R² các mô hình</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats} margin={{top: 20}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontWeight: 600, fontSize: 12}}/>
                <YAxis domain={[0, 1]} axisLine={false} tickLine={false} fontSize={12}/>
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px'}}/>
                <Bar dataKey="r2" radius={[4, 4, 0, 0]} barSize={40}>
                  {stats.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
         </div>

         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Zap size={20} className="text-orange-500"/> Mức độ quan trọng đặc trưng</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={importance} layout="vertical" margin={{left: 20}}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9"/>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} axisLine={false} tickLine={false} tick={{fontWeight: 500, fontSize: 12}}/>
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px'}}/>
                <Bar dataKey="val" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                  <Cell fill="#10b981"/>
                  <Cell fill="#3b82f6"/>
                  <Cell fill="#6366f1"/>
                  <Cell fill="#8b5cf6"/>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;