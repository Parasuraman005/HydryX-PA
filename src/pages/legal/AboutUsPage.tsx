import React, { useState } from 'react';
import { ArrowLeft, Building2, Code, Globe, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import ImageZoomModal from '../../components/ui/ImageZoomModal';
import { cn } from '../../lib/utils';

export default function AboutUsPage() {
  const navigate = useNavigate();
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="p-4 space-y-8 max-w-2xl mx-auto pb-32">
      <ImageZoomModal 
        isOpen={isZoomed} 
        imageSrc="/pa-logo.png" 
        onClose={() => setIsZoomed(false)} 
      />

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-1"
      >
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white rounded-xl shadow-sm border border-blue-100 active:scale-90 transition-all">
          <ArrowLeft size={18} className="text-slate-900" strokeWidth={3} />
        </button>
        <div className="space-y-0.5">
          <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">Developer Profile</p>
          <h2 className="text-xl font-black text-slate-900 tracking-tighter">About Us</h2>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Main Brand Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-blue-100 shadow-sm p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
          
          <div className="flex flex-col items-center gap-6 text-center relative z-10">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">PA SOFTWARES</h1>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Digital Solutions Provider</p>
            </div>

            <div 
              className="w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-100 overflow-hidden cursor-pointer hover:scale-105 transition-transform border-4 border-white"
              onClick={() => setIsZoomed(true)}
            >
              <img src="/pa-logo.png" alt="PA Logo" className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full">
                <User size={14} strokeWidth={3} />
                <p className="text-[10px] font-black uppercase tracking-widest">Founder & CEO: G.PARASU RAMAN</p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium max-w-md mx-auto">
                PA SOFTWARES is a leading software development firm dedicated to creating innovative digital solutions for businesses of all sizes. We specialize in building high-performance web and mobile applications that drive growth and efficiency.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Values Grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Code, label: "Innovation", color: "text-blue-500", bg: "bg-blue-50" },
            { icon: ShieldCheck, label: "Reliability", color: "text-emerald-500", bg: "bg-emerald-50" },
            { icon: Globe, label: "Efficiency", color: "text-purple-500", bg: "bg-purple-50" }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i }}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm"
            >
              <div className={cn("p-2 rounded-xl", item.bg)}>
                <item.icon size={16} className={item.color} />
              </div>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[2.5rem] border border-blue-100 shadow-sm p-8 space-y-6"
        >
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Information</h3>
            <div className="w-12 h-0.5 bg-blue-100 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { icon: Mail, label: "Email", value: "gparasuraman20305@gmail.com", href: "mailto:gparasuraman20305@gmail.com", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: Phone, label: "Phone", value: "+91 9710597141", href: "tel:+919710597141", color: "text-emerald-600", bg: "bg-emerald-50" },
              { icon: Globe, label: "Website", value: "www.pasoftwares.com", href: "https://www.pasoftwares.com", color: "text-purple-600", bg: "bg-purple-50" }
            ].map((item, i) => (
              <a 
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-md transition-all group"
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm", item.bg, item.color)}>
                  <item.icon size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                  <p className="text-xs font-bold text-slate-700">{item.value}</p>
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center space-y-4"
      >
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">© 2026 PA SOFTWARES</p>
      </motion.div>
    </div>
  );
}
