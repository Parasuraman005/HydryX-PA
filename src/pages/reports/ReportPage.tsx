import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Search, Calendar, Download, Plus, CheckCircle, ArrowLeft, FileText, Truck, BarChart3, History, Receipt, Wallet, PackageSearch, TrendingUp, ShoppingBag, CreditCard as CardIcon, Upload, X, Users } from 'lucide-react';
import { Sale, Load, Stats } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useCompany } from '../../contexts/CompanyContext';
import { useData } from '../../contexts/DataContext';
import { storage } from '../../lib/storage';

export default function ReportPage() {
  return (
    <Routes>
      <Route path="/" element={<ReportMain />} />
      <Route path="/billing" element={<BillingHistoryPage />} />
      <Route path="/customer" element={<CustomerReportSearchPage />} />
      <Route path="/load" element={<LoadReportPage />} />
      <Route path="/new-load" element={<NewLoadPage />} />
      <Route path="/product-sales" element={<ProductSalesReportPage />} />
      <Route path="/stock" element={<StockListPage />} />
      <Route path="/new-product" element={<NewProductPage />} />
    </Routes>
  );
}

function ReportMain() {
  const analysisMenus = [
    { title: "Billing History", path: "billing", icon: Receipt, color: "bg-amber-100 text-amber-700", border: "border-amber-200" },
  ];

  const productMenus = [
    { title: "Product Analysis", path: "product-sales", icon: PackageSearch, color: "bg-indigo-100 text-indigo-700", border: "border-indigo-200" },
    { title: "Stock List", path: "stock", icon: History, color: "bg-emerald-100 text-emerald-700", border: "border-emerald-200" },
    { title: "Add Product", path: "new-product", icon: Plus, color: "bg-teal-100 text-teal-700", border: "border-teal-200" },
  ];

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto pb-24 pb-safe">
      <div className="space-y-0.5 ml-1">
        <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.3em]">Analytics</p>
        <h2 className="text-2xl font-black text-brand-dark tracking-tighter">Report Analysis</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {analysisMenus.map(menu => (
          <Link 
            key={menu.title} 
            to={menu.path}
            className={`bg-white p-5 rounded-3xl flex flex-col items-center justify-center gap-3 shadow-sm border ${menu.border} group active:scale-95 transition-all duration-300 ease-in-out h-32 relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-full -mr-8 -mt-8 group-hover:bg-blue-50 transition-colors"></div>
            <div className={`w-12 h-12 ${menu.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 ease-in-out shadow-sm relative z-10`}>
              <menu.icon size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-[10px] font-black text-brand-dark uppercase leading-tight tracking-widest text-center relative z-10">{menu.title}</h3>
          </Link>
        ))}
      </div>

      <div className="space-y-4">
        <div className="space-y-0.5 ml-1">
          <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.3em]">Inventory</p>
          <h2 className="text-xl font-black text-brand-dark tracking-tighter">Product Section</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {productMenus.map(menu => (
            <Link 
              key={menu.title} 
              to={menu.path}
              className={`bg-white p-5 rounded-3xl flex flex-col items-center justify-center gap-3 shadow-sm border ${menu.border} group active:scale-95 transition-all duration-300 ease-in-out h-32 relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-full -mr-8 -mt-8 group-hover:bg-blue-50 transition-colors"></div>
              <div className={`w-12 h-12 ${menu.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 ease-in-out shadow-sm relative z-10`}>
                <menu.icon size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-[10px] font-black text-brand-dark uppercase leading-tight tracking-widest text-center relative z-10">{menu.title}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}



function BillingHistoryPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'All' | 'Entry' | 'Billing'>('All');
  const { sales: allSales, refreshData } = useData();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const { companyInfo } = useCompany();
  const [expandedSaleId, setExpandedSaleId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const sales = allSales.filter(s => !date || s.date.startsWith(date));

  const filteredSales = sales.filter(s => 
    (mode === 'All' || s.type === mode) &&
    (s.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
     s.phone?.includes(search) ||
     s.flat_no?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalBilling = filteredSales.reduce((acc, s) => acc + s.total_amount, 0);
  const totalCredit = filteredSales.reduce((acc, s) => acc + s.credit_amount, 0);

  const handleDelete = async (id: number) => {
    storage.deleteSale(id);
    refreshData();
    setConfirmDeleteId(null);
  };

  const downloadInvoice = (sale: Sale) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const brandColor: [number, number, number] = [0, 86, 179]; // Brand Blue
    const textColor = [0, 0, 0]; // Black

    // --- Header Section ---
    doc.setFontSize(32);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(companyInfo?.name?.toUpperCase() || "V V WATER SUPPLY", 15, 25);

    // Invoice Note Box
    doc.setDrawColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setLineWidth(0.8);
    doc.rect(165, 15, 30, 12);
    doc.setFontSize(9);
    doc.text("INVOICE", 180, 20, { align: "center" });
    doc.text("NOTE", 180, 24, { align: "center" });

    // Prop & GSTIN
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("Prop. ", 15, 33);
    doc.setFont("helvetica", "normal");
    doc.text(`< ${companyInfo?.proprietor || "Propertior name"} >`, 26, 33);
    
    doc.setFont("helvetica", "bold");
    doc.text("GSTIN: ", 90, 33);
    doc.setFont("helvetica", "normal");
    doc.text(`< ${companyInfo?.gstin || "gst in"} >`, 105, 33);

    // Address
    doc.setFont("helvetica", "bold");
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.text("Address : ", 15, 40);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`< ${companyInfo?.address || "address"} >`, 35, 40);

    // Contact as
    doc.setFont("helvetica", "bold");
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.text("Contact as : ", 15, 46);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`< ${companyInfo?.phone1 || "phone no 1"} >  < ${companyInfo?.phone2 || "phone no 2"} >`, 40, 46);

    // --- Bill To & Billing Date Section ---
    doc.setFontSize(13);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 15, 55);
    
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont("helvetica", "normal");
    doc.text(`CUSTOMER NAME : ${sale.customer_name || "Walk-in"}`, 15, 62);
    doc.text(`Address : ${sale.apartment_name || ""} ${sale.flat_no || ""}`, 15, 68);
    doc.text(`Phone no : ${sale.phone || ""}`, 15, 74);

    // Billing Date
    doc.setFontSize(13);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("Billing Date :", 130, 55);
    
    doc.setFontSize(12);
    doc.text("From :", 137, 62);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`< ${new Date(sale.date).toLocaleDateString()} >`, 152, 62);
    
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("To :", 137, 68);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`< ${new Date(sale.date).toLocaleDateString()} >`, 152, 68);

    // --- Table Section ---
    const startY = 85;
    doc.setDrawColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setLineWidth(0.6);
    doc.line(15, startY, 195, startY); // Top line
    
    doc.setFontSize(11);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("No.", 15, startY + 6);
    doc.text("DATE", 40, startY + 6);
    doc.text("Type", 85, startY + 6);
    doc.text("Rate", 130, startY + 6);
    doc.text("QTY", 160, startY + 6);
    doc.text("Amount", 195, startY + 6, { align: "right" });

    doc.line(15, startY + 9, 195, startY + 9); // Bottom line of header

    // Table Body
    let currentY = startY + 16;
    let totalQty = 0;
    let totalAmount = 0;
    let rowNum = 1;

    const items = sale.product_details.split(',').map(item => item.trim());
    items.forEach(item => {
      const parts = item.match(/(.+) x (\d+) @ ([\d.]+) = ([\d.]+)/);
      if (parts) {
        doc.setFontSize(10);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFont("helvetica", "normal");
        
        doc.text(`${rowNum}`, 15, currentY);
        doc.text(new Date(sale.date).toLocaleDateString(), 40, currentY);
        doc.text(parts[1], 85, currentY);
        doc.text(`₹${parts[3]}`, 130, currentY);
        doc.text(`${parts[2]}`, 160, currentY);
        doc.text(`₹${parseFloat(parts[4]).toFixed(2)}`, 195, currentY, { align: "right" });
        
        totalQty += parseInt(parts[2]);
        totalAmount += parseFloat(parts[4]);
        currentY += 8;
        rowNum++;
      }
    });

    // --- Summary Section ---
    const finalY = Math.max(currentY + 10, 200);
    doc.setDrawColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setLineWidth(1);
    doc.rect(15, finalY, 180, 16);
    
    doc.setFontSize(22);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("Net Payment Rs. ₹", 20, finalY + 11);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`${totalAmount.toFixed(2)}`, 90, finalY + 11);
    
    doc.setLineWidth(1);
    doc.line(140, finalY, 140, finalY + 16); // Vertical separator
    
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`${totalQty}`, 160, finalY + 8, { align: "center" });
    doc.setFontSize(8);
    doc.text("Count", 160, finalY + 13, { align: "center" });

    doc.setFontSize(10);
    doc.text(`${totalAmount.toFixed(2)}`, 180, finalY + 8, { align: "center" });
    doc.setFontSize(8);
    doc.text("Total amount", 180, finalY + 13, { align: "center" });

    // --- Footer Section ---
    const footerY = 230;
    doc.setFontSize(12);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("For Payment", 15, footerY);
    
    doc.setFontSize(11);
    doc.text("UPI NAME : ", 15, footerY + 8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`< ${companyInfo?.upiId || companyInfo?.name || "Upi name"} >`, 45, footerY + 8);
    
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("UPI NUMBER : ", 15, footerY + 16);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`< ${companyInfo?.upiNumber || companyInfo?.phone1 || "Upi NUMBER"} >`, 45, footerY + 16);

    doc.setFontSize(11);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(`For ${companyInfo?.name?.toUpperCase() || "V.V WATER SUPPLY"}`, 115, footerY + 16);
    doc.text("RECEIVED BY", 165, footerY + 16);

    // Bottom Bar
    const bottomY = 280;
    doc.setDrawColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setLineWidth(0.4);
    doc.line(15, bottomY - 5, 195, bottomY - 5);
    
    doc.setFontSize(9);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("DEVELOPED & DESIGNED BY PA SOFTWARES", 15, bottomY);
    
    doc.text(`< ${companyInfo?.website1 || "Website link 1"} >`, 195, bottomY, { align: "right" });

    doc.save(`invoice_${sale.customer_name || 'walkin'}.pdf`);
  };

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto pb-24 pb-safe">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">History</p>
          <h2 className="text-xl font-black text-brand-dark tracking-tighter">Billing History</h2>
        </div>
        <div className="flex bg-blue-100/50 p-1 rounded-xl border border-blue-100 backdrop-blur-sm">
          <button 
            onClick={() => setMode('All')}
            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${mode === 'All' ? 'bg-white text-brand-dark shadow-sm border border-blue-100' : 'text-blue-400 hover:text-blue-600'}`}
          >
            All
          </button>
          <button 
            onClick={() => setMode('Entry')}
            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${mode === 'Entry' ? 'bg-white text-brand-dark shadow-sm border border-blue-100' : 'text-blue-400 hover:text-blue-600'}`}
          >
            Entry
          </button>
          <button 
            onClick={() => setMode('Billing')}
            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${mode === 'Billing' ? 'bg-white text-brand-dark shadow-sm border border-blue-100' : 'text-blue-400 hover:text-blue-600'}`}
          >
            Billing
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-blue-100 space-y-1">
          <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Total Billing</p>
          <p className="text-xl font-black text-brand-dark font-mono">₹{totalBilling}</p>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-blue-100 space-y-1">
          <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Total Credit</p>
          <p className="text-xl font-black text-rose-600 font-mono">₹{totalCredit}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH NAME, PHONE, FLAT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-blue-100 bg-white shadow-sm outline-none text-[11px] font-black uppercase tracking-tight focus:ring-4 focus:ring-blue-500/5 transition-all"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center ml-1">
            <label className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">Date</label>
            {date && (
              <button 
                onClick={() => setDate('')}
                className="text-[8px] font-black text-rose-500 uppercase tracking-widest hover:underline transition-all"
              >
                Clear Filter
              </button>
            )}
          </div>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-blue-100 text-[10px] font-black font-mono bg-white shadow-sm outline-none" />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-blue-100">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-blue-50/50 border-b border-blue-100">
                <th className="p-4 text-[8px] font-black text-blue-400 uppercase tracking-widest">#</th>
                <th className="p-4 text-[8px] font-black text-blue-400 uppercase tracking-widest">Customer</th>
                <th className="p-4 text-[8px] font-black text-blue-400 uppercase tracking-widest">Amount</th>
                <th className="p-4 text-[8px] font-black text-blue-400 uppercase tracking-widest">Mode</th>
                <th className="p-4 text-[8px] font-black text-blue-400 uppercase tracking-widest text-center">Inv</th>
                <th className="p-4 text-[8px] font-black text-blue-400 uppercase tracking-widest text-center">Del</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-blue-300 font-black uppercase tracking-widest text-[9px]">No records found</td>
                </tr>
              ) : (
                filteredSales.map((s, idx) => (
                  <React.Fragment key={s.id}>
                    <tr 
                      className="hover:bg-blue-50/30 transition-colors group cursor-pointer" 
                      onClick={() => setExpandedSaleId(expandedSaleId === s.id ? null : s.id)}
                    >
                      <td className="p-4 text-[10px] font-black text-blue-300 font-mono">{idx + 1}</td>
                      <td className="p-4">
                        <div 
                          className="text-[11px] font-black text-brand-dark truncate max-w-[120px] uppercase tracking-tight group-hover:text-blue-600 transition-colors cursor-pointer"
                          onClick={(e) => {
                            if (s.customer_id) {
                              e.stopPropagation();
                              navigate(`/customer-hub/report/${s.customer_id}`);
                            }
                          }}
                        >
                          {s.customer_name || 'Walk-in'}
                        </div>
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{s.flat_no || '-'} {s.phone ? `• ${s.phone}` : ''}</div>
                        {mode === 'All' && <div className="text-[7px] font-black text-blue-400 uppercase tracking-widest mt-0.5">{s.type}</div>}
                      </td>
                      <td className="p-4 text-[11px] font-black text-brand-dark font-mono">₹{s.total_amount}</td>
                      <td className="p-4">
                        <div className={`text-[8px] font-black uppercase tracking-widest ${s.payment_mode === 'Credit' ? 'text-rose-500' : 'text-emerald-500'}`}>{s.payment_mode}</div>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={(e) => { e.stopPropagation(); downloadInvoice(s); }}
                          className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-brand-dark hover:text-white transition-all active:scale-90 shadow-sm"
                        >
                          <Download size={14} strokeWidth={2.5} />
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(s.id); }}
                          className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-90 shadow-sm"
                        >
                          <X size={14} strokeWidth={2.5} />
                        </button>
                      </td>
                    </tr>
                    {expandedSaleId === s.id && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={6} className="p-4">
                          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Product Details</h4>
                            <div className="space-y-2">
                              {s.product_details.split(', ').map((p, i) => {
                                const parts = p.split(' @ ');
                                const nameQty = parts[0].split(' x ');
                                const name = nameQty[0];
                                const qty = parseInt(nameQty[1]) || 0;
                                let rate = '-';
                                let total = '-';
                                if (parts.length > 1) {
                                  const rateTotal = parts[1].split(' = ');
                                  rate = rateTotal[0];
                                  total = rateTotal[1];
                                }
                                return (
                                  <div key={i} className="flex justify-between items-center text-[10px] font-black text-brand-dark">
                                    <span className="uppercase tracking-tight flex-1">{name}</span>
                                    <span className="font-mono w-16 text-center">₹{rate}</span>
                                    <span className="font-mono w-16 text-center">x{qty}</span>
                                    <span className="font-mono w-20 text-right">₹{total}</span>
                                  </div>
                                );
                              })}
                              <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-[10px] font-black text-brand-dark uppercase tracking-widest">Total Amount</span>
                                <span className="text-[12px] font-black text-brand-dark font-mono">₹{s.total_amount}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="sm:hidden divide-y divide-blue-50">
          {filteredSales.length === 0 ? (
            <div className="p-16 text-center text-blue-300 font-black uppercase tracking-widest text-[9px]">No records found</div>
          ) : (
            filteredSales.map((s, idx) => (
              <div key={s.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div 
                    className="flex-1"
                    onClick={() => setExpandedSaleId(expandedSaleId === s.id ? null : s.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-blue-300 font-mono">#{idx + 1}</span>
                      <h4 className="text-[11px] font-black text-brand-dark uppercase tracking-tight truncate max-w-[150px]">
                        {s.customer_name || 'Walk-in'}
                      </h4>
                    </div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                      {s.flat_no || '-'} {s.phone ? `• ${s.phone}` : ''}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-[7px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-md ${s.payment_mode === 'Credit' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                        {s.payment_mode}
                      </span>
                      {mode === 'All' && (
                        <span className="text-[7px] font-black text-blue-400 uppercase tracking-[0.2em] bg-blue-50 px-1.5 py-0.5 rounded-md">
                          {s.type}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-black text-brand-dark font-mono">₹{s.total_amount}</p>
                    <div className="flex gap-2 mt-2 justify-end">
                      <button 
                        onClick={() => downloadInvoice(s)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg active:scale-90 transition-all"
                      >
                        <Download size={14} />
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(s.id)}
                        className="p-2 bg-rose-50 text-rose-600 rounded-lg active:scale-90 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {expandedSaleId === s.id && (
                  <div className="bg-slate-50 rounded-2xl p-3 space-y-2 border border-slate-100">
                    <h5 className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Details</h5>
                    {s.product_details.split(', ').map((p, i) => {
                      const parts = p.split(' @ ');
                      const nameQty = parts[0].split(' x ');
                      const name = nameQty[0];
                      const qty = parseInt(nameQty[1]) || 0;
                      let rate = '-';
                      let total = '-';
                      if (parts.length > 1) {
                        const rateTotal = parts[1].split(' = ');
                        rate = rateTotal[0];
                        total = rateTotal[1];
                      }
                      return (
                        <div key={i} className="flex justify-between items-center text-[9px] font-black text-brand-dark">
                          <span className="uppercase tracking-tight flex-1 truncate mr-2">{name}</span>
                          <span className="font-mono">₹{rate} x {qty} = ₹{total}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteId(null)}
              className="absolute inset-0 bg-brand-dark/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[32px] p-8 shadow-2xl border border-blue-50 w-full max-w-sm overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
              
              <div className="relative z-10 text-center space-y-6">
                <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto text-rose-500 mb-2">
                  <X size={32} strokeWidth={2.5} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight">Confirm Delete</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                    Are you sure you want to delete this record? This action cannot be undone and will update all reports.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setConfirmDeleteId(null)}
                    className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleDelete(confirmDeleteId)}
                    className="flex-1 py-4 rounded-2xl bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95"
                  >
                    Delete Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CustomerReportSearchPage() {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCustomers(storage.getCustomers());
  }, []);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search) || 
    c.flat_no.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto pb-24 pb-safe">
      <div className="space-y-0.5 ml-1">
        <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.3em]">Registry</p>
        <h2 className="text-xl font-black text-brand-dark tracking-tighter">Customer Report</h2>
      </div>
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-blue-600 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="SEARCH CUSTOMER..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-blue-100 bg-white shadow-sm outline-none text-[11px] font-black uppercase tracking-tight focus:ring-4 focus:ring-blue-500/5 transition-all"
        />
      </div>
      <div className="space-y-2">
        {filtered.map(c => (
          <button 
            key={c.id}
            onClick={() => navigate(`/customer-hub/report/${c.id}`)}
            className="w-full bg-white p-4 rounded-2xl shadow-sm border border-blue-100 flex justify-between items-center active:scale-95 transition-all group hover:border-blue-200"
          >
            <div className="text-left">
              <div className="font-black text-brand-dark text-[11px] group-hover:text-blue-600 transition-colors uppercase tracking-tight">{c.name}</div>
              <div className="text-[8px] text-blue-400 font-black uppercase tracking-widest">FLAT: {c.flat_no} • {c.phone}</div>
            </div>
            <ArrowLeft className="rotate-180 text-blue-300 group-hover:text-blue-600 transition-colors" size={16} strokeWidth={2.5} />
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="p-16 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest bg-white rounded-3xl border border-blue-100 border-dashed">No customers found</div>
        )}
      </div>
    </div>
  );
}

function LoadReportPage() {
  const navigate = useNavigate();
  const [loads, setLoads] = useState<Load[]>([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    let data = storage.getLoads();
    if (dateRange.from) {
      data = data.filter(l => l.date >= dateRange.from);
    }
    if (dateRange.to) {
      data = data.filter(l => l.date <= dateRange.to);
    }
    setLoads(data);
  }, [dateRange]);

  const totalPending = loads.filter(l => l.type === 'Pending').reduce((acc, l) => acc + l.amount, 0);

  const handleSettlement = async (id: number) => {
    storage.updateLoad(id, { type: 'Paid' });
    // Refresh
    let data = storage.getLoads();
    if (dateRange.from) {
      data = data.filter(l => l.date >= dateRange.from);
    }
    if (dateRange.to) {
      data = data.filter(l => l.date <= dateRange.to);
    }
    setLoads(data);
  };

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto pb-24 pb-safe">
      <div className="flex justify-between items-end ml-1">
        <div className="space-y-0.5">
          <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.3em]">Analytics</p>
          <h2 className="text-xl font-black text-brand-dark tracking-tighter">Load Report</h2>
        </div>
        <button 
          onClick={() => navigate('/report/new-load')}
          className="bg-brand-dark text-white px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-brand-dark/20"
        >
          <Plus size={14} strokeWidth={3} />
          ADD LOAD
        </button>
      </div>

      <div className="bg-brand-dark text-white p-6 rounded-3xl shadow-xl shadow-brand-dark/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl group-hover:bg-white/20 transition-colors"></div>
        <p className="text-[8px] font-black uppercase opacity-60 tracking-[0.3em] relative z-10">Total Pending Amount</p>
        <p className="text-3xl font-black tracking-tighter mt-1 relative z-10 font-mono">₹{totalPending}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em] ml-1">Date From</label>
          <input type="date" value={dateRange.from} onChange={e => setDateRange({...dateRange, from: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-blue-100 text-[10px] font-black font-mono bg-white shadow-sm outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em] ml-1">To</label>
          <input type="date" value={dateRange.to} onChange={e => setDateRange({...dateRange, to: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-blue-100 text-[10px] font-black font-mono bg-white shadow-sm outline-none" />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-blue-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-blue-50/50 text-blue-400 font-black uppercase tracking-widest text-[8px]">
              <tr>
                <th className="p-4">DATE</th>
                <th className="p-4">LOAD</th>
                <th className="p-4">AMT</th>
                <th className="p-4 text-center">ACT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {loads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-16 text-center text-[9px] font-black text-slate-300 uppercase tracking-widest">No loads found</td>
                </tr>
              ) : (
                loads.map(l => (
                  <tr key={l.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4 text-[10px] font-black text-brand-dark font-mono">{new Date(l.date).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="font-black text-brand-dark text-[11px] truncate max-w-[120px] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{l.supplier_name}</div>
                      <div className="text-[8px] text-blue-400 font-black truncate max-w-[120px] uppercase tracking-widest">{l.details}</div>
                    </td>
                    <td className="p-4 font-black text-brand-dark text-[11px] font-mono">₹{l.amount}</td>
                    <td className="p-4 text-center">
                      {l.type === 'Pending' ? (
                        <button 
                          onClick={() => handleSettlement(l.id)} 
                          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all hover:bg-brand-dark active:scale-95 shadow-sm"
                        >
                          SETTLE
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-black text-[9px] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg">PAID</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function NewLoadPage() {
  const [form, setForm] = useState({ supplier: '', date: '', details: '', amount: '', type: 'Paid' as 'Paid' | 'Pending' });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    storage.addLoad({
      supplier_name: form.supplier,
      details: form.details,
      amount: parseFloat(form.amount),
      type: form.type,
      date: form.date
    });
    navigate('/report/load');
  };

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto pb-24 pb-safe">
      <div className="space-y-0.5 ml-1">
        <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.3em]">Inventory</p>
        <h2 className="text-xl font-black text-brand-dark tracking-tighter">New Load Entry</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 space-y-5">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Supplier Name</label>
          <input 
            type="text" 
            placeholder="ENTER SUPPLIER NAME..."
            value={form.supplier}
            onChange={e => setForm({...form, supplier: e.target.value})}
            className="w-full px-4 py-3.5 rounded-2xl border border-blue-50 bg-slate-50/50 focus:bg-white focus:border-blue-200 outline-none font-black text-[11px] uppercase tracking-tight transition-all"
            required 
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
            <input 
              type="date" 
              value={form.date}
              onChange={e => setForm({...form, date: e.target.value})}
              className="w-full px-4 py-3.5 rounded-2xl border border-blue-50 bg-slate-50/50 focus:bg-white focus:border-blue-200 outline-none font-black text-[11px] font-mono transition-all"
              required 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount</label>
            <input 
              type="number" 
              placeholder="0.00"
              value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})}
              className="w-full px-4 py-3.5 rounded-2xl border border-blue-50 bg-slate-50/50 focus:bg-white focus:border-blue-200 outline-none font-black text-[11px] font-mono transition-all"
              required 
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Load Details</label>
          <textarea 
            placeholder="ENTER LOAD DETAILS..."
            value={form.details}
            onChange={e => setForm({...form, details: e.target.value})}
            className="w-full px-4 py-3.5 rounded-2xl border border-blue-50 bg-slate-50/50 focus:bg-white focus:border-blue-200 outline-none font-black text-[11px] uppercase tracking-tight transition-all h-24 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={() => setForm({...form, type: 'Paid'})} 
            className={`flex-1 py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${form.type === 'Paid' ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-white text-slate-400 border-blue-50'}`}
          >
            PAID
          </button>
          <button 
            type="button" 
            onClick={() => setForm({...form, type: 'Pending'})} 
            className={`flex-1 py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${form.type === 'Pending' ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20' : 'bg-white text-slate-400 border-blue-50'}`}
          >
            PENDING
          </button>
        </div>

        <button 
          type="submit" 
          className="w-full bg-brand-dark text-white py-4.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-brand-dark/20 active:scale-95 transition-all mt-4"
        >
          PROCESS LOAD
        </button>
      </form>
    </div>
  );
}

function ProductSalesReportPage() {
  const navigate = useNavigate();
  const { products } = useData();
  const [data, setData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    const sales = storage.getSales();
    const productSales: { [key: string]: number } = {};
    
    sales.forEach(sale => {
      if (sale.product_details) {
        const items = sale.product_details.split(', ');
        items.forEach(item => {
          const parts = item.split(' x ');
          if (parts.length > 1) {
            const name = parts[0];
            const qtyStr = parts[1].split(' @ ')[0];
            const qty = parseInt(qtyStr) || 0;
            productSales[name] = (productSales[name] || 0) + qty;
          }
        });
      }
    });

    const chartData = Object.entries(productSales).map(([name, sales]) => ({
      name: name.split(' ')[0], // Shorten name for display
      sales: sales
    })).sort((a, b) => b.sales - a.sales).slice(0, 5);

    setData(chartData);
  }, [dateRange]);

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto pb-24 pb-safe">
      <div className="space-y-0.5 ml-1">
        <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.3em]">Analytics</p>
        <h2 className="text-xl font-black text-brand-dark tracking-tighter">Product Analysis</h2>
      </div>
      
      {/* Monthly Graph */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 h-64 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 group-hover:bg-blue-100 transition-colors"></div>
        <div className="flex justify-between items-center mb-4 relative z-10">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sales Performance</h3>
          <TrendingUp size={16} className="text-blue-500" strokeWidth={2.5} />
        </div>
        <div className="h-44 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 8, fill: '#94a3b8', fontWeight: '900'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 8, fill: '#94a3b8', fontWeight: '900'}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase'}} />
              <Bar dataKey="sales" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Details */}
      <div className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <div className="space-y-0.5">
            <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.3em]">Inventory</p>
            <h3 className="text-sm font-black text-brand-dark uppercase tracking-tighter">Inventory Details</h3>
          </div>
          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">{products.length} Items</span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {products.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-3xl shadow-sm border border-blue-100 flex items-center gap-4 group hover:border-blue-200 hover:shadow-md transition-all active:scale-[0.98]">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-inner bg-slate-50 border border-slate-100 relative">
                <img src={product.image || 'https://picsum.photos/seed/product/100/100'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-xs text-brand-dark truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">{product.name}</h4>
                <div className="flex gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <ShoppingBag size={10} className="text-slate-300" />
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">PK: {product.packing || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={10} className="text-slate-300" />
                    <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">₹{product.rate}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => navigate('/products')}
                className="bg-blue-50 text-blue-600 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-dark hover:text-white transition-all active:scale-90 shadow-sm"
              >
                EDIT
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StockListPage() {
  const { products } = useData();

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto pb-24 pb-safe">
      <div className="space-y-0.5 ml-1">
        <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.3em]">Inventory</p>
        <h2 className="text-xl font-black text-brand-dark tracking-tighter">Stock List</h2>
      </div>
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-blue-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-blue-50/50 text-blue-400 font-black uppercase tracking-widest text-[8px]">
              <tr>
                <th className="p-4">PRODUCT</th>
                <th className="p-4 text-right">RATE</th>
                <th className="p-4 text-right pr-6">STOCK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-16 text-center text-[9px] font-black text-slate-300 uppercase tracking-widest">No stock data available</td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4 font-black text-brand-dark text-[10px] truncate max-w-[140px] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{p.name}</td>
                    <td className="p-4 font-black text-brand-dark text-[10px] font-mono text-right">₹{p.rate}</td>
                    <td className="p-4 text-right pr-6">
                      <span className={`font-black text-[10px] font-mono px-3 py-1 rounded-xl shadow-sm ${p.stock < 10 ? 'text-rose-600 bg-rose-50 border border-rose-100' : 'text-emerald-600 bg-emerald-50 border border-emerald-100'}`}>
                         {p.stock}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function NewProductPage() {
  const [form, setForm] = useState({ 
    name: '', 
    image: '', 
    purchasingRate: '', 
    gst: '', 
    packing: '', 
    caseSellingRate: '', 
    singleSellingRate: '', 
    stock: '' 
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({...form, image: reader.result as string});
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const purchasingRate = parseFloat(form.purchasingRate) || 0;
  const caseSellingRate = parseFloat(form.caseSellingRate) || 0;
  const singleSellingRate = parseFloat(form.singleSellingRate) || 0;

  const caseMargin = caseSellingRate > 0 ? (((caseSellingRate - purchasingRate) / caseSellingRate) * 100).toFixed(2) : '0.00';
  const singleMargin = singleSellingRate > 0 ? (((singleSellingRate - purchasingRate) / singleSellingRate) * 100).toFixed(2) : '0.00';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    storage.addProduct({
      ...form,
      purchasingRate: purchasingRate,
      gst: parseFloat(form.gst) || 0,
      caseSellingRate: caseSellingRate,
      singleSellingRate: singleSellingRate,
      stock: parseInt(form.stock) || 0
    });
    navigate('/report/stock');
  };

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto pb-24">
      <div className="flex items-center gap-4 ml-1">
        <button onClick={() => navigate('/report')} className="p-3 bg-white rounded-2xl shadow-sm border border-blue-100 text-blue-500 hover:bg-blue-50 transition-all active:scale-90">
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <div className="space-y-0.5">
          <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.3em]">Management</p>
          <h2 className="text-xl font-black text-brand-dark tracking-tighter">Add Product</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 space-y-5">
        <div className="flex justify-center mb-4">
          <div className="relative group">
            <div className="w-28 h-28 bg-slate-50 rounded-3xl border-2 border-dashed border-blue-100 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-300 group-hover:bg-blue-50/30 shadow-inner">
              {form.image ? (
                <img src={form.image} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              ) : (
                <div className="text-center space-y-1.5">
                  <Upload className="mx-auto text-blue-200 group-hover:text-blue-400 transition-colors" size={24} strokeWidth={2.5} />
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">Upload Image</p>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
            <input 
              type="text" 
              placeholder="ENTER PRODUCT NAME..."
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-4 py-3.5 rounded-2xl border border-blue-50 bg-slate-50/50 focus:bg-white focus:border-blue-200 outline-none font-black text-[11px] uppercase tracking-tight transition-all"
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cost Rate</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={form.purchasingRate}
                onChange={e => setForm({...form, purchasingRate: e.target.value})}
                className="w-full px-4 py-3.5 rounded-2xl border border-blue-50 bg-slate-50/50 focus:bg-white focus:border-blue-200 outline-none font-black text-[11px] font-mono transition-all"
                required 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">GST %</label>
              <input 
                type="number" 
                placeholder="0"
                value={form.gst}
                onChange={e => setForm({...form, gst: e.target.value})}
                className="w-full px-4 py-3.5 rounded-2xl border border-blue-50 bg-slate-50/50 focus:bg-white focus:border-blue-200 outline-none font-black text-[11px] font-mono transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Packing</label>
            <input 
              type="text" 
              placeholder="E.G., 24 X 1L"
              value={form.packing}
              onChange={e => setForm({...form, packing: e.target.value})}
              className="w-full px-4 py-3.5 rounded-2xl border border-blue-50 bg-slate-50/50 focus:bg-white focus:border-blue-200 outline-none font-black text-[11px] uppercase tracking-tight transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Case Rate</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={form.caseSellingRate}
                onChange={e => setForm({...form, caseSellingRate: e.target.value})}
                className="w-full px-4 py-3.5 rounded-2xl border border-blue-50 bg-slate-50/50 focus:bg-white focus:border-blue-200 outline-none font-black text-[11px] font-mono transition-all"
              />
              <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest ml-1">Margin: {caseMargin}%</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Single Rate</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={form.singleSellingRate}
                onChange={e => setForm({...form, singleSellingRate: e.target.value})}
                className="w-full px-4 py-3.5 rounded-2xl border border-blue-50 bg-slate-50/50 focus:bg-white focus:border-blue-200 outline-none font-black text-[11px] font-mono transition-all"
              />
              <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest ml-1">Margin: {singleMargin}%</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Stock</label>
            <input 
              type="number" 
              placeholder="0"
              value={form.stock}
              onChange={e => setForm({...form, stock: e.target.value})}
              className="w-full px-4 py-3.5 rounded-2xl border border-blue-50 bg-slate-50/50 focus:bg-white focus:border-blue-200 outline-none font-black text-[11px] font-mono transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={() => navigate('/report')} className="flex-1 bg-slate-100 text-slate-600 py-4.5 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all">CANCEL</button>
          <button type="submit" className="flex-1 bg-brand-dark text-white py-4.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-brand-dark/20 active:scale-95 transition-all">SAVE PRODUCT</button>
        </div>
      </form>
    </div>
  );
}
