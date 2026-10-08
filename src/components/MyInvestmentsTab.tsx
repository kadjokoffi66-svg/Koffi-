import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, formatDateFR, getTimeRemaining } from '../utils/formatters';
import { 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Calendar, 
  Sparkles,
  Zap,
  RotateCcw
} from 'lucide-react';

export const MyInvestmentsTab: React.FC = () => {
  const { investments, setActiveTab, setSelectedPlanForModal, plans, setIsInvestModalOpen } = useApp();
  const [filter, setFilter] = useState<'active' | 'completed' | 'all'>('active');
  const [, setTick] = useState(0);

  // Live timer tick every second for live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeInvestments = investments.filter((i) => i.status === 'active');
  const completedInvestments = investments.filter((i) => i.status === 'completed');

  const displayedList = investments.filter((inv) => {
    if (filter === 'active') return inv.status === 'active';
    if (filter === 'completed') return inv.status === 'completed';
    return true;
  });

  const totalActiveInvested = activeInvestments.reduce((sum, i) => sum + i.investedAmount, 0);
  const totalExpectedGain = activeInvestments.reduce((sum, i) => sum + (i.expectedTotalReturn - i.investedAmount), 0);

  return (
    <div className="space-y-4 pb-20 pt-1">
      {/* Top Banner / Summary */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Mes Titres d'Investissement
            </span>
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[11px] font-black text-white">
              {activeInvestments.length} En circulation
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
              <span className="text-[10px] text-blue-200 block">Total en circulation</span>
              <p className="text-lg font-black tracking-tight text-white mt-0.5">
                {formatFCFA(totalActiveInvested)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
              <span className="text-[10px] text-blue-200 block">Rendement attendu</span>
              <p className="text-lg font-black tracking-tight text-emerald-300 mt-0.5">
                +{formatFCFA(totalExpectedGain)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-1.5 flex items-center shadow-xs text-xs font-bold">
        <button
          onClick={() => setFilter('active')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            filter === 'active'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>En circulation ({activeInvestments.length})</span>
        </button>

        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            filter === 'completed'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Terminés ({completedInvestments.length})</span>
        </button>

        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-2.5 rounded-xl transition-all ${
            filter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Tous ({investments.length})
        </button>
      </div>

      {/* List of Investments */}
      {displayedList.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-slate-800 text-sm">
            {filter === 'active' ? 'Aucun investissement en circulation' : 'Aucun investissement terminé'}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {filter === 'active'
              ? 'Choisissez un produit FIX ou ACTIVITÉ à partir de 2 000 F CFA pour lancer votre premier rendement.'
              : 'Vos investissements arrivés à échéance apparaîtront ici avec la confirmation du versement.'}
          </p>
          <button
            onClick={() => setActiveTab('invest')}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-md transition-all inline-flex items-center gap-1.5"
          >
            <span>Découvrir les produits</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {displayedList.map((inv) => {
            const countdown = getTimeRemaining(inv.endDate);
            const isActive = inv.status === 'active';
            
            // Progress calculation
            const startMs = new Date(inv.startDate).getTime();
            const endMs = new Date(inv.endDate).getTime();
            const nowMs = Date.now();
            const totalDurationMs = Math.max(1, endMs - startMs);
            const elapsedMs = Math.max(0, nowMs - startMs);
            const progressPercent = isActive 
              ? Math.min(100, Math.max(5, Math.round((elapsedMs / totalDurationMs) * 100)))
              : 100;

            return (
              <div
                key={inv.id}
                className="bg-white border border-slate-200/90 rounded-3xl p-4.5 shadow-sm space-y-3.5 transition-all hover:shadow-md"
              >
                {/* Header card */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-xs shadow-xs ${
                      isActive ? 'bg-gradient-to-tr from-blue-600 to-indigo-600' : 'bg-slate-400'
                    }`}>
                      {inv.category === 'activity' ? '⚡' : '🔒'}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm leading-tight">
                        {inv.planName}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        ID: {inv.id} • Durée : {inv.durationDays} Jours
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      EN CIRCULATION
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      TERMINÉ
                    </span>
                  )}
                </div>

                {/* Main Figures Grid */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Montant investi</span>
                    <p className="font-mono text-xs font-black text-slate-900 mt-0.5">
                      {formatFCFA(inv.investedAmount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Rendement</span>
                    <p className="font-mono text-xs font-black text-emerald-600 mt-0.5">
                      +{inv.returnRatePercent}%
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Prévu à l'échéance</span>
                    <p className="font-mono text-xs font-black text-blue-700 mt-0.5">
                      {formatFCFA(inv.expectedTotalReturn)}
                    </p>
                  </div>
                </div>

                {/* Progress bar and countdown */}
                {isActive ? (
                  <div className="space-y-2 pt-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        Temps restant :
                      </span>
                      <span className="font-mono font-black text-blue-700 text-xs bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {countdown.formatted}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                        <span>Début : {formatDateFR(inv.startDate)}</span>
                        <span className="font-bold text-slate-700">{progressPercent}%</span>
                        <span>Échéance : {formatDateFR(inv.endDate)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-200">
                    <span className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Fonds et gains crédités sur votre solde
                    </span>
                    <span className="font-mono font-black">
                      +{formatFCFA(inv.expectedTotalReturn)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
