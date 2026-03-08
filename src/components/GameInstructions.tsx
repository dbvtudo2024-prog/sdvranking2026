
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Info } from 'lucide-react';

interface GameInstructionsProps {
  isOpen: boolean;
  onStart: () => void;
  title: string;
  instructions: string[];
  icon?: React.ReactNode;
}

const GameInstructions: React.FC<GameInstructionsProps> = ({ isOpen, onStart, title, instructions, icon }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6 text-center"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl"
          >
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-blue-600/20">
              {icon || <Info size={32} className="text-white" />}
            </div>
            
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">{title}</h3>
            
            <div className="space-y-3 mb-8 text-left">
              {instructions.map((inst, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-blue-400">{index + 1}</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{inst}</p>
                </div>
              ))}
            </div>

            <button
              onClick={onStart}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <Play size={18} fill="currentColor" /> ENTENDI, COMEÇAR!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameInstructions;
