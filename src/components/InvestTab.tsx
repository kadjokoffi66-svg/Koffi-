import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InvestmentPlan } from '../types';
import { formatFCFA } from '../utils/formatters';
import { 
  ShieldCheck, 
  Zap, 
  Flame, 
  Clock, 
  TrendingUp, 
  Check, 
  AlertTriangle,
  Info,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const InvestTab: React.FC = () => {
  const { plans, setSelectedPlanForModal, setIsInvestModalOpen, user, setActiveTab } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'fix' | 'activity'>('all');
  const [activePlanId, setActivePlanId] = useState<string>('fix-1');

  const filteredPlans = plans.filter((p) => {
    if (!p.isActive) return false;
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const selectedPlan = plans.find((p) => p.id === activePlanId) || filteredPlans[0] || plans[0];

  const handleOpenInvest = (plan: InvestmentPlan) => {
    setSelectedPlanForModal(plan);
    setIsInvestModalOpen(true);
  };

  return (
    <div className="space-y-4 pb-20 pt-1">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Catalogue Officiel des Produits
            </span>
            <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
              Dès 2 000 FCFA
            </span>
          </div>

          <h2 className="text-xl font-black text-white tracking-tight">
            Produits FIX & ACTIVITÉ
          </h2>
          <p className="text-xs text-blue-100 max-w-sm">
            Investissez sur des durées de 3 à 90 jours avec calcul automatique du montant prévu à l'échéance.
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <span className="text-blue-200">Solde disponible :</span>
            <span className="font-mono font-black text-amber-300 text-sm">
              {formatFCFA(user.balance)}
            </span>
          </div>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-1.5 flex items-center shadow-xs text-xs font-bold">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`flex-1 py-2.5 rounded-xl transition-all ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tous les produits ({plans.filter((p) => p.isActive).length})
        </button>

        <button
          onClick={() => setSelectedCategory('fix')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
            selectedCategory === 'fix'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Produits FIX (30j - 90j)</span>
        </button>

        <button
          onClick={() => setSelectedCategory('activity')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
            selectedCategory === 'activity'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>ACTIVITÉ (3j - 20j)</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="space-y-3">
        {filteredPlans.map((plan) => {
          const isFix = plan.category === 'fix';
          const sampleInvest = 10000;
          const sampleReturn = Math.round(sampleInvest + sampleInvest * (plan.totalReturnRatePercent / 100));

          return (
            <div
              key={plan.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-xs hover:shadow-md transition-all space-y-3"
            >
              {/* Product Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-xs ${
                    isFix 
                      ? 'bg-gradient-to-tr from-blue-600 to-indigo-700' 
                      : 'bg-gradient-to-tr from-amber-500 to-orange-600'
                  }`}>
                    {isFix ? '🔒' : '⚡'}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        {plan.name}
                      </h3>
                      {plan.badge && (
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.2 rounded-full text-[9px] font-black uppercase">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Durée : <strong className="text-slate-800">{plan.durationDays} Jours</strong>
                    </p>
                  </div>
                </div>

                {/* Return rate pill */}
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">Rendement total</span>
                  <span className="text-base font-black text-emerald-600 font-mono">
                    +{plan.totalReturnRatePercent}%
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {plan.description}
              </p>

              {/* Key metrics grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50/80 rounded-2xl p-2.5 border border-slate-100 font-medium">
                <div>
                  <span className="text-[10px] text-slate-400 block">Montant Min</span>
                  <span className="font-black text-slate-900">{formatFCFA(plan.minAmount)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Rendement / jour</span>
                  <span className="font-bold text-blue-600">~{plan.dailyRatePercent}% / j</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Ex: 10 000 F donne</span>
                  <span className="font-black text-emerald-600">{formatFCFA(sampleReturn)}</span>
                </div>
              </div>

              {/* Bottom Action bar */}
              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={() => handleOpenInvest(plan)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white font-extrabold py-3 px-4 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Investir dans {plan.name}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transparency & Regulatory Disclaimer (Section 26 of specs) */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3.5 space-y-1.5 text-xs text-amber-900">
        <div className="flex items-center space-x-1.5 font-black">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Transparence & Conditions Financières</span>
        </div>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          Tous les montants débutent à partir de 2 000 F CFA. Les fonds souscrits sont mis en circulation pour la durée exacte sélectionnée. Le montant prévu à l'échéance est calculé automatiquement et crédité sur votre solde disponible dès l'expiration du contrat.
        </p>
      </div>
    </div>
  );
};
