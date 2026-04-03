import React, { useState } from 'react';
import { ArrowLeft, Info, Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ImageZoomModal from '../../components/ui/ImageZoomModal';

export default function HydryXPage() {
  const navigate = useNavigate();
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="p-4 space-y-6 pb-24 max-w-2xl mx-auto">
      <ImageZoomModal 
        isOpen={isZoomed} 
        imageSrc="/hydryX-logo.png" 
        onClose={() => setIsZoomed(false)} 
      />

      <div className="flex items-center gap-3 px-1">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white rounded-xl shadow-sm border border-blue-100 active:scale-90 transition-all">
          <ArrowLeft size={18} className="text-brand-dark" strokeWidth={3} />
        </button>
        <div className="space-y-0.5">
          <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">Application</p>
          <h2 className="text-xl font-black text-brand-dark tracking-tighter">About HydryX</h2>
        </div>
      </div>

      {/* App Logo & Name Section */}
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div 
          className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-200 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setIsZoomed(true)}
        >
          <img src="/hydryX-logo.png" alt="Hydryx Logo" className="w-full h-full object-contain p-3" referrerPolicy="no-referrer" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-black text-blue-950 tracking-tighter">HydryX</h1>
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Smart Water Delivery</p>
        </div>
      </div>

      {/* Description Section */}
      <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-blue-100 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
        
        <div className="flex items-center gap-2 text-brand-dark relative z-10">
          <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
            <Info size={14} strokeWidth={3} />
          </div>
          <h3 className="font-black text-[10px] uppercase tracking-widest">Brief Description</h3>
        </div>

        <div className="space-y-4 relative z-10">
          <p className="text-sm font-black text-slate-700 leading-relaxed tracking-tight">
            Hydryx is an advanced mobile-based Android application designed to simplify and digitalize daily water delivery operations. Built for water-can suppliers and retailers, Hydryx helps businesses manage customer data, track sales, maintain credit ledgers, monitor deposits, handle billing, and generate invoices — all within one seamless platform.
          </p>
          
          <div className="space-y-3 pt-2">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Key Functions</h4>
            <div className="grid grid-cols-1 gap-2">
              {[
                "Customer Management & Registry",
                "Daily Sales & Delivery Tracking",
                "Credit Ledger & Settlement System",
                "Empty Can & Deposit Monitoring",
                "Automated Billing & PDF Invoices",
                "WhatsApp Payment Reminders"
              ].map((func, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {func}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 mt-4">
            <p className="text-sm text-blue-700 leading-relaxed font-bold italic text-center">
              "This app is developed and designed only for V V water supply shop and requirements."
            </p>
          </div>
        </div>
      </section>

      {/* Version Info */}
      <div className="flex justify-center">
        <div className="px-4 py-2 bg-slate-100 rounded-full">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Version 1.0.4 (Stable)</p>
        </div>
      </div>

      <div className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] pt-8">
        DEVELOPED & DESIGNED BY PA SOFTWARES
      </div>
    </div>
  );
}
