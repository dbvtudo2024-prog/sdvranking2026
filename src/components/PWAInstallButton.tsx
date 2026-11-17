import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ className = '', compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={
          className ||
          `inline-flex items-center justify-center gap-2 rounded-full bg-[#0061f2] hover:bg-[#0052cc] text-white font-black uppercase tracking-[0.15em] shadow-lg shadow-blue-500/20 transition-all active:scale-95 ${
            compact ? 'px-4 py-2 text-[10px]' : 'w-full px-6 py-3 text-[10px]'
          }`
        }
      >
        <Download size={16} />
        <span>Instalar App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={
            className ||
            `inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#0061f2] bg-white dark:bg-slate-800 text-[#0061f2] dark:text-blue-400 font-black uppercase tracking-[0.15em] transition-all active:scale-95 ${
              compact ? 'px-4 py-2 text-[10px]' : 'w-full px-6 py-3 text-[10px]'
            }`
          }
        >
          <Share size={16} />
          <span>Instalar no iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800 text-left">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
                  Instalar no iPhone / iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                1. Toque no botão <strong>Compartilhar</strong> na barra do Safari.<br />
                2. Role para baixo e toque em <strong>Adicionar à Tela de Início</strong>.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-2xl bg-[#0061f2] py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-[#0052cc] transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
