import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PredictionList from './pages/PredictionList';
import LookupPage from './pages/LookupPage'; // <--- Trang mới
import { LayoutDashboard, Database, Search } from 'lucide-react';

const NavLink = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center gap-3 p-3 rounded-xl transition font-medium ${isActive ? 'bg-emerald-500 text-white shadow-md' : 'hover:bg-slate-800 text-slate-300'}`}>
      {icon} {label}
    </Link>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
        <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col gap-8 shadow-2xl z-10">
          <div className="border-b border-slate-700 pb-6">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-tighter italic">WeatherML</h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">Pipeline - XGBoost</p>
          </div>
          <nav className="flex flex-col gap-2">
            <NavLink to="/" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
            <NavLink to="/lookup" icon={<Search size={20}/>} label="Tra Cứu & Đối Soát" /> {/* <--- Link mới */}
            <NavLink to="/list" icon={<Database size={20}/>} label="Kho Dữ Liệu" />
          </nav>
        </aside>
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/lookup" element={<LookupPage />} /> {/* <--- Route mới */}
            <Route path="/list" element={<PredictionList />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}