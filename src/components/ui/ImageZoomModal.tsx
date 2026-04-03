import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ImageZoomModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
}

export default function ImageZoomModal({ isOpen, imageSrc, onClose }: ImageZoomModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 text-white p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            src={imageSrc}
            alt="Zoomed"
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
