import React from 'react';
import { useApp, TabType } from '../context/AppContext';
import { 
  Home, 
  Zap, 
  Clock, 
  Receipt, 
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, investments } = useApp();

  const activeInvsCount = Array.isArray(investments) 
    ? investments.filter((i) => i && i.status === 'active').length 
    : 0;

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Accueil',
      icon: Home,
    },
    {
      id: 'invest',
      label: 'Investir',
      icon: Zap,
    },
    {
      id: 'my-investments',
      label: 'En circulation',
      icon: Clock,
      badge: activeInvsCount > 0 ? activeInvsCount : undefined,
    },
    {
      id: 'transactions',
      label: 'Historique',
      icon: Receipt,
    },
    {
      id: 'account',
      label: 'Profil',
      icon: UserIcon,
    },
  ];

  return (
    <nav aria-label="Navigation principale" className="fixed bottom-0 left-0 right-0 z-30 bg-white/98 backdrop-blur-md border-t border-slate-200/80 shadow-lg">
      <div className="max-w-md mx-auto px-1.5 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-blue-600 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-semibold">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-4 h-1 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
