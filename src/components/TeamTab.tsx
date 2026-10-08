import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA } from '../utils/formatters';
import { 
  Copy, 
  Check, 
  Users, 
  Award, 
  ChevronRight, 
  Share2,
  TrendingUp,
  Gift
} from 'lucide-react';

export const TeamTab: React.FC = () => {
  const { user, team, config, showToast } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);

  // Link format as in screenshot 4: https://www.luckyinvests.cc/?invitation_code=67CC6
  const invitationLink = `https://www.luckyinvests.cc/?invitation_code=${user.referralCode}`;

  const copyInvitation = () => {
    navigator.clipboard.writeText(invitationLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    showToast('Lien d\'invitation copié dans le presse-papier !', 'success');
  };

  const teamList = Array.isArray(team) ? team : [];
  const level1Count = teamList.filter((m) => m && m.level === 1).length;
  const level2Count = teamList.filter((m) => m && m.level === 2).length;
  const level3Count = teamList.filter((m) => m && m.level === 3).length;

  return (
    <div className="space-y-4 pb-20 pt-1">
      {/* Top Blue Hero Card: Commission & Team Illustration (Screenshot 4) */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white p-5 shadow-lg relative overflow-hidden flex items-center justify-between">
        <div className="space-y-1 z-10">
          <span className="text-xs font-medium text-blue-100 block">Commission</span>
          <div className="text-3xl font-black text-white tracking-wide">
            FCFA{user.totalCommission || 0}
          </div>
          <p className="text-[10px] text-blue-100">Commissions créditées immédiatement</p>
        </div>

        {/* Team Avatars Illustration on Right */}
        <div className="w-24 h-20 relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-xs font-black text-slate-900 shadow-md -mr-3 z-20">
            🤝
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-sm font-black text-white shadow-md z-10">
            👥
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-400 border-2 border-white flex items-center justify-center text-xs font-black text-white shadow-md -ml-3 z-0">
            ⭐
          </div>
        </div>
      </div>

      {/* Invitation Link Card with Blue 'Copier' pill button (Screenshot 4) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-xs">Lien d'invitation</h3>
              <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                {invitationLink}
              </p>
            </div>
          </div>

          <button
            onClick={copyInvitation}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-xs transition-all flex items-center gap-1"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copié' : 'Copier'}</span>
          </button>
        </div>
      </div>

      {/* Team Levels Header & Details Link (Screenshot 4) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-slate-900 text-sm">Niveau de l'équipe</h3>
          <span className="text-xs text-slate-500 font-medium flex items-center">
            Détails de l'équipe &gt;
          </span>
        </div>

        {/* Level 1 Card (Yellow banner style) */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/90 rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-r-full -ml-4 shadow-xs">
              Niveau 1
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-200/80 border border-amber-300 flex items-center justify-center text-sm">
              🥇
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-base font-black text-slate-900 block">30%</span>
              <span className="text-[10px] text-slate-500 font-medium">Remise Niveau 1</span>
            </div>
            <div>
              <span className="text-base font-black text-slate-900 block">{level1Count}</span>
              <span className="text-[10px] text-slate-500 font-medium">Total invités</span>
            </div>
            <div>
              <span className="text-base font-black text-slate-900 block">{level1Count}</span>
              <span className="text-[10px] text-slate-500 font-medium">Actifs</span>
            </div>
          </div>
        </div>

        {/* Level 2 Card (Blue banner style) */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="bg-blue-600 text-white font-black text-xs px-3 py-1 rounded-r-full -ml-4 shadow-xs">
              Niveau 2
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-200/80 border border-blue-300 flex items-center justify-center text-sm">
              🥈
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-base font-black text-slate-900 block">5%</span>
              <span className="text-[10px] text-slate-500 font-medium">Remise Niveau 2</span>
            </div>
            <div>
              <span className="text-base font-black text-slate-900 block">{level2Count}</span>
              <span className="text-[10px] text-slate-500 font-medium">Total invités</span>
            </div>
            <div>
              <span className="text-base font-black text-slate-900 block">{level2Count}</span>
              <span className="text-[10px] text-slate-500 font-medium">Actifs</span>
            </div>
          </div>
        </div>

        {/* Level 3 Card (Red / Coral banner style) */}
        <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200/90 rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="bg-rose-500 text-white font-black text-xs px-3 py-1 rounded-r-full -ml-4 shadow-xs">
              Leve3
            </span>
            <div className="w-8 h-8 rounded-full bg-rose-200/80 border border-rose-300 flex items-center justify-center text-sm">
              🥉
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-base font-black text-slate-900 block">2%</span>
              <span className="text-[10px] text-slate-500 font-medium">Remise Niveau 3</span>
            </div>
            <div>
              <span className="text-base font-black text-slate-900 block">{level3Count}</span>
              <span className="text-[10px] text-slate-500 font-medium">Total invités</span>
            </div>
            <div>
              <span className="text-base font-black text-slate-900 block">{level3Count}</span>
              <span className="text-[10px] text-slate-500 font-medium">Actifs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
