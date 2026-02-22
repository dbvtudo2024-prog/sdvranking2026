
import React from 'react';
import { Announcement } from '../types';
import { Bell } from 'lucide-react';

interface TickerBannerProps {
  announcements: Announcement[];
}

const TickerBanner: React.FC<TickerBannerProps> = ({ announcements }) => {
  if (announcements.length === 0) return null;

  const renderAnnouncements = (prefix: string) => (
    announcements.map((a, i) => (
      <span key={`${prefix}-${i}`} className="inline-flex items-center">
        <span className="text-[10px] text-slate-600 uppercase tracking-tight">
          <span className="font-black text-slate-900">{a.title}:</span> {a.content}
        </span>
        <span className="mx-10 text-slate-300 font-bold">•</span>
      </span>
    ))
  );

  return (
    <div className="bg-amber-50 border-b border-amber-100 py-2 overflow-hidden whitespace-nowrap flex items-center shrink-0">
      <div className="px-3 bg-amber-50 z-10 flex items-center gap-2 text-amber-600 border-r border-amber-100">
        <Bell size={14} className="animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-widest">Avisos</span>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className="inline-block animate-marquee hover:pause-marquee pl-4">
          {renderAnnouncements('set1')}
          {renderAnnouncements('set2')}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
        .hover\\:pause-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  );
};

export default TickerBanner;
