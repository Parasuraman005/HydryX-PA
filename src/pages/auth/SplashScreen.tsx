import React, { useEffect } from 'react';
import { motion } from 'motion/react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-brand-dark flex flex-col items-center justify-center py-8 sm:py-12 px-4 text-white overflow-hidden z-[100]"
    >
      {/* Decorative background lines (Lining) */}
      <div className="absolute inset-0 opacity-15 pointer-events-none flex justify-center items-center">
        {/* Responsive grid lines */}
        <div className="absolute top-0 bottom-0 w-[1px] bg-white left-[10%] sm:left-[15%]"></div>
        <div className="absolute top-0 bottom-0 w-[1px] bg-white right-[10%] sm:right-[15%]"></div>
        <div className="absolute left-0 right-0 h-[1px] bg-white top-[15%] sm:top-[20%]"></div>
        <div className="absolute left-0 right-0 h-[1px] bg-white bottom-[15%] sm:bottom-[20%]"></div>
        
        {/* Center crosshair */}
        <div className="absolute w-8 h-[1px] bg-white"></div>
        <div className="absolute h-8 w-[1px] bg-white"></div>
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center z-10 w-full max-w-sm relative"
      >
        {/* Logo Mark */}
        <div className="relative mb-6 sm:mb-8 group">
          <div className="absolute inset-0 border border-white/20 rounded-full scale-110"></div>
          <div className="absolute inset-0 border border-white/10 rounded-full scale-125"></div>
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center shadow-2xl relative z-10 overflow-hidden">
            <img src="/hydryX-logo.png" alt="Hydryx Logo" className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
          </div>
        </div>
        
        {/* Typography & Lining */}
        <div className="flex flex-col items-center relative w-full">
          <div className="flex items-center w-full justify-center gap-3 sm:gap-4 mb-4 sm:mb-5">
            <div className="h-[1px] bg-white/30 flex-1 max-w-[30px] sm:max-w-[60px]"></div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase text-white">Hydryx</h1>
            <div className="h-[1px] bg-white/30 flex-1 max-w-[30px] sm:max-w-[60px]"></div>
          </div>
          
          <div className="flex flex-col items-center space-y-2 sm:space-y-3 relative w-full px-2">
            <p className="text-[8px] sm:text-[10px] font-medium text-blue-100 uppercase tracking-[0.2em] sm:tracking-[0.4em] text-center leading-relaxed">
              Save water.<br/>Shape the future.
            </p>
            
            <div className="flex items-center gap-1.5 sm:gap-2 opacity-60 py-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            
            <p className="text-[7px] sm:text-[9px] font-bold text-white uppercase tracking-[0.2em] sm:tracking-[0.5em] text-center whitespace-nowrap">
              Track <span className="text-white/30 mx-1">|</span> Save <span className="text-white/30 mx-1">|</span> Flow
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Footer Typography */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="absolute bottom-8 sm:bottom-12 z-10 flex flex-col items-center gap-2 sm:gap-3 w-full"
      >
        <div className="w-[1px] h-4 sm:h-8 bg-gradient-to-b from-white/0 via-white/40 to-white/0"></div>
        <div className="space-y-1 text-center">
          <p className="text-[8px] sm:text-[10px] font-black text-white uppercase tracking-[0.2em] sm:tracking-[0.25em]">
            DEVELOPED & DESIGNED BY PA SOFTWARES
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
