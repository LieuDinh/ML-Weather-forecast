import React, { useState, useEffect } from 'react';
import { weatherApi } from '../api/weatherApi';
import { ChevronLeft, ChevronRight, Filter, Download } from 'lucide-react';

const PredictionList = () => {
  const [data, setData] = useState({ items: [], total_pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [province, setProvince] = useState("");

  useEffect(() => {
    weatherApi.getPredictions(page, 15, province || null)
      .then(res => setData(res.data.data))
      .catch(err => console.error(err));
  }, [page, province]);

  // Hàm tính sai số để render màu sắc
  const getErrorBadge = (actual, predicted) => {
    const error = Math.abs(actual - predicted);
    if (error < 2) return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">Rất Tốt</span>;
    if (error < 5) return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Chấp Nhận</span>;
    return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">Có Lệch</span>;
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Kho Dữ Liệu Dự Báo 2021</h2>
          <p className="text-slate-500 mt-1">Tổng cộng {data.total} bản ghi được nội suy và dự báo</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 font-medium shadow-sm transition">
          <Download size={16}/> Xuất CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all shadow-sm">
            <Filter size={18} className="text-slate-400"/>
            <input 
              type="number" 
              placeholder="Lọc theo mã tỉnh (0-62)..." 
              className="bg-transparent border-none focus:ring-0 text-sm w-48 outline-none text-slate-700"
              value={province}
              onChange={(e) => { setProvince(e.target.value); setPage(1); }}
            />
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Đang hiển thị trang <span className="text-slate-900 font-bold">{page}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Ngày</th>
                <th className="px-6 py-4">Mã Tỉnh</th>
                <th className="px-6 py-4">Tên Tỉnh</th>
                <th className="px-6 py-4 text-right">Thực tế (mm)</th>
                <th className="px-6 py-4 text-right text-emerald-600">XGBoost (mm)</th>
                <th className="px-6 py-4 text-center">Đánh giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data.items.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">{item.date}</td>
                  <td className="px-6 py-4 text-sm"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono">{item.province_code}</span></td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{item.province_name}</td>
                  <td className="px-6 py-4 text-right font-mono">{item.actual_rain_mm.toFixed(1)}</td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600 font-mono bg-emerald-50/30 group-hover:bg-emerald-50/50">{item.predicted_rain_mm.toFixed(1)}</td>
                  <td className="px-6 py-4 text-center">
                    {getErrorBadge(item.actual_rain_mm, item.predicted_rain_mm)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center">
          <p className="text-sm text-slate-500">Hiển thị 15 kết quả mỗi trang</p>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 border border-slate-200 rounded-lg shadow-sm disabled:opacity-30 hover:bg-slate-50 text-slate-600 transition"
            ><ChevronLeft size={18}/></button>
            <span className="text-sm font-bold text-slate-700 px-4">Trang {page} / {data.total_pages}</span>
            <button 
              disabled={page === data.total_pages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 border border-slate-200 rounded-lg shadow-sm disabled:opacity-30 hover:bg-slate-50 text-slate-600 transition"
            ><ChevronRight size={18}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionList;