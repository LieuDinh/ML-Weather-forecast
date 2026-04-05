import React, { useState } from 'react';
import { weatherApi } from '../api/weatherApi';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell, Area, AreaChart, Legend } from 'recharts';
import { Search, MapPin, Calendar, CloudRain, Sun, AlertCircle, Activity } from 'lucide-react';
import { PROVINCES } from './Dashboard'; // Tái sử dụng danh sách tỉnh từ Dashboard

const LookupPage = () => {
  const [params, setParams] = useState({ date: '2021-01-01', province: 1 });
  const [result, setResult] = useState(null);
  const [trendData, setTrendData] = useState([]); // State mới lưu dữ liệu 30 ngày
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Gọi API lấy dữ liệu của chính ngày đó
      const resSingle = await weatherApi.getCompare(params.date, params.province);
      setResult(resSingle.data.data);

      // 2. Gọi API lấy dữ liệu 30 ngày của TỈNH đó để vẽ biểu đồ line
      const resTrend = await weatherApi.getPredictions(1, 30, params.province);
      setTrendData(resTrend.data.data.items);
      
    } catch (err) {
      setError('Không tìm thấy dữ liệu cho ngày và mã tỉnh này (Chỉ hỗ trợ dữ liệu Test năm 2021).');
      setResult(null);
      setTrendData([]);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 bg-[#f8fafc] min-h-screen">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Công Cụ Tra Cứu & Đối Soát</h2>
        <p className="text-slate-500 mt-2">Đánh giá độ lệch chuẩn xác của XGBoost theo từng ngày và xem xu hướng cả tháng.</p>
      </div>

      {/* Bộ lọc Tra cứu */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-6 items-end relative z-20">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2"><Calendar size={16}/> Ngày dự báo</label>
          <input 
            type="date" 
            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition font-mono"
            value={params.date}
            onChange={(e) => setParams({...params, date: e.target.value})}
          />
        </div>
        
        {/* DROPDOWN CHỌN TỈNH SANG TRỌNG */}
        <div className="w-64">
          <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2"><MapPin size={16}/> Chọn Tỉnh Thành</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition cursor-pointer text-slate-700 font-medium"
            value={params.province}
            onChange={(e) => setParams({...params, province: parseInt(e.target.value)})}
          >
            {PROVINCES.map(p => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleSearch} disabled={loading}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 h-[50px]"
        >
          {loading ? 'Đang tải...' : <><Search size={20}/> Tra Cứu</>}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Kết quả Tra cứu */}
      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          
          {/* Hàng 1: Thẻ thông tin ngày được chọn */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -right-4 -top-4 opacity-10">
                {result.predicted_rain_mm > 5 ? <CloudRain size={160}/> : <Sun size={160}/>}
              </div>
              <div>
                <p className="text-emerald-400 font-mono text-sm mb-1">{result.date}</p>
                <h3 className="text-3xl font-black mb-6 z-10 relative">{result.province_name}</h3>
              </div>
              <div className="flex gap-4 relative z-10">
                <div className="flex-1 bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <p className="text-slate-400 text-xs font-bold uppercase">XGBoost Dự Báo</p>
                  <p className="text-3xl font-mono text-emerald-400 mt-1">{result.predicted_rain_mm.toFixed(2)} <span className="text-sm">mm</span></p>
                </div>
                <div className="flex-1 bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <p className="text-slate-400 text-xs font-bold uppercase">Thực Tế</p>
                  <p className="text-3xl font-mono text-white mt-1">{result.actual_rain_mm.toFixed(2)} <span className="text-sm">mm</span></p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border-2 shadow-sm flex flex-col justify-center ${result.absolute_error_mm < 2 ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'}`}>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sai số tuyệt đối (MAE)</p>
               <h4 className={`text-5xl font-black mt-2 mb-2 ${result.absolute_error_mm < 2 ? 'text-emerald-600' : 'text-orange-600'}`}>
                 {result.absolute_error_mm.toFixed(2)} <span className="text-xl">mm</span>
               </h4>
               <p className="text-sm text-slate-600 font-medium">
                 {result.absolute_error_mm < 2 ? '✅ Dự báo cực kỳ chuẩn xác.' : '⚠️ Có sai lệch do nhiễu thời tiết.'}
               </p>
            </div>
          </div>

          {/* Hàng 2: BIỂU ĐỒ 30 NGÀY CỦA RIÊNG TỈNH ĐÓ */}
          {trendData.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <Activity className="text-emerald-500"/> Xu hướng 30 ngày của {result.province_name}
                </h3>
                <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">Biểu đồ đối soát</span>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} minTickGap={30}/>
                    <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} unit="mm" />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}/>
                    <Legend verticalAlign="top" height={36} iconType="circle"/>
                    <Area type="monotone" name="Dự báo XGBoost" dataKey="predicted_rain_mm" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
                    <Line type="monotone" name="Thực tế" dataKey="actual_rain_mm" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={{r: 3, fill: '#94a3b8'}} activeDot={{r: 6}} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default LookupPage;