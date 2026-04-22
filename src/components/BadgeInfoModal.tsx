
import React from 'react';
import { X, Trophy, Shield, Medal, Brain, Map, Book, Gamepad2, MessageSquare, Type, Check, HelpCircle } from 'lucide-react';
import { BadgeDefinition, BadgeLevel } from '@/types';

const BADGE_ICONS: { [key: string]: any } = {
  'Shield': Shield,
  'Type': Type,
  'Gamepad2': Gamepad2,
  'MessageSquare': MessageSquare,
  'Brain': Brain,
  'Map': Map,
  'Book': Book,
  'Medal': Medal,
  'CheckCircle2': Check
};

interface BadgeInfoModalProps {
  badge: BadgeDefinition;
  onClose: () => void;
  isDarkMode?: boolean;
}

const BadgeInfoModal: React.FC<BadgeInfoModalProps> = ({ badge, onClose, isDarkMode }) => {
  const BadgeIcon = BADGE_ICONS[badge.icon] || HelpCircle;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[300] flex items-center justify-center p-6 sm:p-4">
      <div className={`relative w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <button onClick={onClose} className={`absolute top-5 right-5 p-2 rounded-full transition-colors z-50 ${isDarkMode ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-300'}`}>
          <X size={20} />
        </button>
        
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
               <BadgeIcon size={24} />
            </div>
            <div className="flex-1 min-w-0">
               <h3 className={`text-sm font-black uppercase tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{badge.name}</h3>
               <p className={`text-[8px] font-black uppercase tracking-widest ${isDarkMode ? 'text-blue-400/70' : 'text-blue-400'}`}>{badge.category}</p>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border-2 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
             <p className={`text-[10px] font-bold leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {badge.description}
             </p>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-[#0061f2] text-white font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default BadgeInfoModal;
