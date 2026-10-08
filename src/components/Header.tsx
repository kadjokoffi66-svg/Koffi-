import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Smartphone, 
  Monitor, 
  Wrench, 
  Sparkles,
  PhoneCall,
  Bell,
  Clock
} from 'lucide-react';

interface HeaderProps {
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ isMobileFrame, setIsMobileFrame }) => {
  const { user, setIsAdminModalOpen, config, notifications, setActiveTab, investments } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const activeInvsCount = investments.filter((i) => i.status === 'active').length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 shadow-xs">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand Logo & Platform Name */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center space-x-2.5 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center p-0.5 shadow-md text-white font-black text-xs">
            CI
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-slate-900 text-sm tracking-tight">InvestCI</span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-600 inline" />
              <span>Plateforme d'Investissement Sécurisée</span>
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1.5">
          {/* Active circulation indicator */}
          {activeInvsCount > 0 && (
            <button
              onClick={() => setActiveTab('my-investments')}
              title={`${activeInvsCount} investissement(s) en circulation`}
              className="hidden xs:flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full text-[10px] font-black"
            >
              <Clock className="w-3 h-3 text-emerald-600" />
              <span>{activeInvsCount} actif(s)</span>
            </button>
          )}

          {/* WhatsApp Support Direct button */}
          <a
            href={`https://wa.me/${(config?.whatsappSupportNumber || '+2250576140220').replace(/[^0-9]/g, '')}?text=Bonjour%2C%20j%27ai%20besoin%20d%27assistance%20sur%20InvestCI`}
            target="_blank"
            rel="noopener noreferrer"
            title="Support WhatsApp"
            className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors border border-emerald-200"
          >
            <PhoneCall className="w-4 h-4" />
          </a>

          {/* Admin & Simulator modal trigger */}
          <button
            onClick={() => setIsAdminModalOpen(true)}
            title="Panneau Administrateur"
            className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 flex items-center justify-center transition-colors border border-amber-200"
          >
            <Wrench className="w-4 h-4" />
          </button>

          {/* Desktop/Mobile frame toggle for test preview */}
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            title={isMobileFrame ? "Passer en vue large" : "Passer en vue mobile"}
            className="hidden sm:flex w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 items-center justify-center transition-colors"
          >
            {isMobileFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
