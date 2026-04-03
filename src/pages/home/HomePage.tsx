import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Users, 
  FileText, 
  Truck, 
  Plus, 
  Search, 
  Download, 
  CheckCircle, 
  MessageSquare, 
  Phone, 
  Home, 
  Settings, 
  Receipt, 
  Wallet, 
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { useCompany } from '../../contexts/CompanyContext';
import { cn } from '../../lib/utils';
import { storage } from '../../lib/storage';

const IconMap: any = {
  PlusCircle, Users, FileText, Truck, Plus, Search, Download, CheckCircle, MessageSquare, Phone, Home, Settings, Receipt, Wallet, BarChart3
};

interface HomePageProps {
  username: string;
}

const HomePage = ({ username }: HomePageProps) => {
  const [stats, setStats] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const { quickActions, companyInfo } = useCompany();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchData = () => {
      const statsData = storage.getStats();
      setStats(statsData);
      
      const salesData = storage.getSales();
      const sales = salesData.slice(-5).reverse();
      setRecentSales(sales);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dateStr = currentTime.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const dayName = dayNames[currentTime.getDay()];
  const timeStr = currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto pb-24">
      {/* Header Section */}
      <div className="space-y-0.5">
        <h2 className="text-xl font-black text-brand-dark tracking-tight uppercase">HI {companyInfo?.proprietor || username || 'admin'}</h2>
        <div className="flex justify-between items-center">
          <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">{companyInfo?.name || 'HYDRYX'}</p>
          <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">GST: {companyInfo?.gstin || 'N/A'}</p>
        </div>
      </div>

      {/* Monthly Sales Slider - Minimized */}
      <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
        <div className="flex gap-3">
          {/* Current Month */}
          <div className="min-w-full snap-center shrink-0">
            <div className="bg-brand-dark rounded-2xl p-3.5 text-white relative overflow-hidden shadow-lg shadow-brand-dark/10">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div className="relative z-10 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <p className="text-[7px] font-black text-brand-light/40 uppercase tracking-[0.2em]">This Month</p>
                    <h3 className="text-sm font-black tracking-tight">{stats?.currentMonth?.name}</h3>
                  </div>
                  <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-md">
                    <BarChart3 size={14} />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[7px] font-black text-brand-light/40 uppercase tracking-widest">Total Sales</p>
                  <p className="text-xl font-black tracking-tighter font-mono">₹{stats?.currentMonth?.total?.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 text-[6px] font-black uppercase tracking-widest text-emerald-400">
                  <Plus size={6} strokeWidth={4} />
                  <span>Growth Tracked</span>
                </div>
              </div>
            </div>
          </div>

          {/* Last Month */}
          <div className="min-w-full snap-center shrink-0">
            <div className="bg-blue-600 rounded-2xl p-3.5 text-white relative overflow-hidden shadow-lg shadow-blue-600/10">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div className="relative z-10 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <p className="text-[7px] font-black text-white/40 uppercase tracking-[0.2em]">Last Month</p>
                    <h3 className="text-sm font-black tracking-tight">{stats?.lastMonth?.name}</h3>
                  </div>
                  <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-md">
                    <Receipt size={14} />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[7px] font-black text-white/40 uppercase tracking-widest">Total Sales</p>
                  <p className="text-xl font-black tracking-tighter font-mono">₹{stats?.lastMonth?.total?.toLocaleString()}</p>
                </div>
                <div className="text-[6px] font-black uppercase tracking-widest text-white/60">
                  <span>Previous Performance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date & Time Section */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{dateStr}, {dayName}</p>
        </div>
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest font-mono">{timeStr}</p>
      </div>

      {/* Stats Grid - Responsive columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Today Sale", value: stats?.today?.sale_cash_upi, color: "border-blue-500", icon: BarChart3, iconColor: "text-blue-600", bg: "bg-blue-50", path: "/report/billing" },
          { label: "Today Cash", value: stats?.today?.cash, color: "border-emerald-500", icon: Wallet, iconColor: "text-emerald-600", bg: "bg-emerald-50", path: "/report/billing" },
          { label: "Today UPI", value: stats?.today?.upi, color: "border-indigo-500", icon: CheckCircle, iconColor: "text-indigo-600", bg: "bg-indigo-50", path: "/report/billing" },
          { label: "Total Pending", value: stats?.totalCreditAmount, color: "border-rose-500", icon: Receipt, iconColor: "text-rose-600", bg: "bg-rose-50", path: "/customer-hub/credit" },
          { label: "Credit Recv", value: stats?.today?.credit_received, color: "border-amber-500", icon: PlusCircle, iconColor: "text-amber-600", bg: "bg-amber-50", path: "/customer-hub/credit/history" },
          { label: "Overall Sale", value: stats?.today?.overall_sale, color: "border-purple-500", icon: ShieldCheck, iconColor: "text-purple-600", bg: "bg-purple-50", path: "/report/billing" },
        ].map((item, idx) => (
          <Link 
            key={idx} 
            to={item.path}
            className={cn("bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-2 border-l-4 active:scale-95 transition-all", item.color)}
          >
            <div className="flex justify-between items-start">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-tight">{item.label}</p>
              <div className={cn("p-1 rounded-lg", item.bg)}>
                <item.icon size={10} className={item.iconColor} />
              </div>
            </div>
            <p className="text-xs font-black text-brand-dark font-mono truncate">₹{item.value?.toLocaleString() || 0}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      {quickActions && quickActions.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Quick Actions</h3>
            <Link to="/quick-settings" className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">Manage</Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action: any, idx: number) => {
              const Icon = IconMap[action.icon] || Plus;
              return (
                <button
                  key={idx}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-blue-600 group-active:scale-90 transition-all">
                    <Icon size={20} />
                  </div>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter text-center leading-tight">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Recent Transactions</h3>
          <Link to="/report" className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All</Link>
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-50">
            {recentSales.map((sale, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-sm",
                    sale.type === 'Billing' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                  )}>
                    {sale.customer_name?.[0] || 'C'}
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-brand-dark uppercase tracking-tight">{sale.customer_name}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(sale.date).toLocaleDateString()} • {sale.payment_mode}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-black text-brand-dark font-mono">₹{sale.amount_received}</p>
                  {sale.credit_amount > 0 && (
                    <p className="text-[8px] font-black text-rose-500 uppercase tracking-tighter">Credit: ₹{sale.credit_amount}</p>
                  )}
                </div>
              </div>
            ))}
            {recentSales.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No recent transactions</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default HomePage;
