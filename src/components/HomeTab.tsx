import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA } from '../utils/formatters';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  CreditCard, 
  Zap, 
  Headphones,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
  Calculator,
  UserCheck
} from 'lucide-react';

export const HomeTab: React.FC = () => {
  const { 
    user, 
    plans, 
    investments, 
    transactions,
    config, 
    setIsDepositModalOpen, 
    setIsWithdrawModalOpen, 
    setSelectedPlanForModal,
    setIsInvestModalOpen,
    setIsAuthModalOpen,
    setActiveTab 
  } = useApp();

  const activeInvestments = investments.filter((i) => i.status === 'active');
  const completedInvestments = investments.filter((i) => i.status === 'completed');

  // Calculator State (Section 22 of specs)
  const [calcPlanId, setCalcPlanId] = useState<string>('fix-1');
  const [calcAmount, setCalcAmount] = useState<number>(10000);

  const calcPlan = plans.find((p) => p.id === calcPlanId) || plans[0];
  const calcReturn = Math.round(calcAmount + calcAmount * (calcPlan.totalReturnRatePercent / 100));
  const calcGain = calcReturn - calcAmount;

  return (
    <div className="space-y-4 pb-20 pt-1">
      {/* Top Header Profile & Support Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center p-1 shadow-md text-white font-black text-sm">
            CI
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900 block">
                {user.fullName || 'Investisseur CI'}
              </span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                Vérifié
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              {user.phoneNumber}
            </p>
          </div>
        </div>

        <a
          href={`https://wa.me/${(config.whatsappSupportNumber || '+2250576140220').replace(/[^0-9]/g, '')}?text=Bonjour%20service%20client`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold transition-colors shadow-2xs"
          title="Service Client WhatsApp"
        >
          <Headphones className="w-3.5 h-3.5 text-emerald-600" />
          <span>Support</span>
        </a>
      </div>

      {/* Main Dashboard Hero Card (Section 10 of specs) */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 rounded-3xl text-white p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-1 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-200 uppercase tracking-wider block">
              Solde Disponible
            </span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold text-white">
              Retirable 24/7
            </span>
          </div>
          <div className="text-3xl font-black text-white tracking-tight font-mono">
            {formatFCFA(user.balance)}
          </div>
        </div>

        {/* Dashboard 4 Metrics Grid (Section 10: Total investi, En circulation, Terminés, Total retraits) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/15 text-xs">
          <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-xs">
            <span className="text-[10px] text-blue-200 block">Total Investi</span>
            <p className="font-mono font-black text-white text-xs mt-0.5">
              {formatFCFA(user.totalInvested)}
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('my-investments')}
            className="bg-white/10 hover:bg-white/15 cursor-pointer rounded-2xl p-2.5 backdrop-blur-xs transition-colors"
          >
            <span className="text-[10px] text-blue-200 block">En circulation</span>
            <p className="font-mono font-black text-emerald-300 text-xs mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              {activeInvestments.length} actif(s)
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('my-investments')}
            className="bg-white/10 hover:bg-white/15 cursor-pointer rounded-2xl p-2.5 backdrop-blur-xs transition-colors"
          >
            <span className="text-[10px] text-blue-200 block">Terminés</span>
            <p className="font-mono font-black text-white text-xs mt-0.5">
              {completedInvestments.length} produit(s)
            </p>
          </div>

          <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-xs">
            <span className="text-[10px] text-blue-200 block">Total Retraits</span>
            <p className="font-mono font-black text-white text-xs mt-0.5">
              {formatFCFA(user.totalWithdrawn)}
            </p>
          </div>
        </div>

        {/* Main Quick Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-4">
          <button
            onClick={() => setIsDepositModalOpen(true)}
            className="bg-white text-blue-900 font-extrabold py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center space-x-1.5 shadow-md active:scale-98 transition-all hover:bg-blue-50"
          >
            <ArrowDownLeft className="w-4 h-4 text-blue-700" />
            <span>Déposer</span>
          </button>

          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="bg-white/15 hover:bg-white/25 border border-white/20 text-white font-extrabold py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center space-x-1.5 transition-all active:scale-98"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span>Retirer (6%)</span>
          </button>

          <button
            onClick={() => setActiveTab('invest')}
            className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center space-x-1.5 shadow-md active:scale-98 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Investir</span>
          </button>
        </div>
      </div>

      {/* Section 11 Alert : Investissement en circulation preview */}
      {activeInvestments.length > 0 && (
        <div 
          onClick={() => setActiveTab('my-investments')}
          className="cursor-pointer bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-4 flex items-center justify-between shadow-xs transition-all hover:shadow-md"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="font-extrabold text-slate-900 text-xs">
                  {activeInvestments.length} Investissement(s) en circulation
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Suivez votre compte à rebours et date d'échéance en direct &gt;
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-emerald-700" />
        </div>
      )}

      {/* CALCULATEUR INTERACTIF EN DIRECT (Section 22 du cahier des charges) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4.5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Calculateur de Rendement
              </h3>
              <p className="text-[10px] text-slate-500">Estimez vos gains avant souscription</p>
            </div>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
            Temps Réel
          </span>
        </div>

        {/* Step 1: Choose Product */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-700 block">
            1. Choisissez un produit :
          </label>
          <select
            value={calcPlanId}
            onChange={(e) => setCalcPlanId(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-hidden focus:border-blue-600"
          >
            <optgroup label="Produits FIX (30 à 90 jours)">
              <option value="fix-1">FIX 1 — 90 JOURS (+180%)</option>
              <option value="fix-2">FIX 2 — 60 JOURS (+120%)</option>
              <option value="fix-3">FIX 3 — 30 JOURS (+60%)</option>
            </optgroup>
            <optgroup label="Produits ACTIVITÉ (3 à 20 jours)">
              <option value="act-01">ACTIVITÉ 01 — 3 jours (+15%)</option>
              <option value="act-02">ACTIVITÉ 02 — 5 jours (+30%)</option>
              <option value="act-03">ACTIVITÉ 03 — 7 jours (+45%)</option>
              <option value="act-04">ACTIVITÉ 04 — 10 jours (+65%)</option>
              <option value="act-05">ACTIVITÉ 05 — 12 jours (+80%)</option>
              <option value="act-06">ACTIVITÉ 06 — 15 jours (+105%)</option>
              <option value="act-07">ACTIVITÉ 07 — 18 jours (+130%)</option>
              <option value="act-08">ACTIVITÉ 08 — 20 jours (+150%)</option>
            </optgroup>
          </select>
        </div>

        {/* Step 2: Choose Amount */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-700 block">
            2. Choisissez le montant à investir :
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[2000, 5000, 10000, 25000, 50000, 100000, 250000, 500000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setCalcAmount(amt)}
                className={`py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                  calcAmount === amt
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {amt.toLocaleString('fr-FR')} F
              </button>
            ))}
          </div>
        </div>

        {/* Calculation Result Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Durée du placement :</span>
            <span className="font-extrabold text-slate-900">{calcPlan.durationDays} Jours</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Rendement configuré :</span>
            <span className="font-black text-emerald-600">+{calcPlan.totalReturnRatePercent}%</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Bénéfice net estimé :</span>
            <span className="font-extrabold text-emerald-700">+{formatFCFA(calcGain)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-200 text-sm font-black">
            <span className="text-slate-900">Montant prévu à l'échéance :</span>
            <span className="font-mono text-blue-700">{formatFCFA(calcReturn)}</span>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedPlanForModal(calcPlan);
            setIsInvestModalOpen(true);
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold py-3 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Investir maintenant dans {calcPlan.name}</span>
        </button>
      </div>

      {/* Featured Products Showcase (FIX 1, FIX 2, FIX 3, ACTIVITÉ) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-slate-900 text-sm">
            Produits d'Investissement Disponibles
          </h3>
          <button
            onClick={() => setActiveTab('invest')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            Tout voir ({plans.length}) &gt;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {plans.slice(0, 4).map((plan) => (
            <div
              key={plan.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-xs space-y-3 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {plan.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Durée : {plan.durationDays} Jours • Dès {formatFCFA(plan.minAmount)}
                  </p>
                </div>
                <span className="font-mono font-black text-emerald-600 text-sm">
                  +{plan.totalReturnRatePercent}%
                </span>
              </div>

              <p className="text-[11px] text-slate-500 line-clamp-2">
                {plan.description}
              </p>

              <button
                onClick={() => {
                  setSelectedPlanForModal(plan);
                  setIsInvestModalOpen(true);
                }}
                className="w-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-800 font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Détails & Investir</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transparency & Legal Note (Section 26 of specs) */}
      <div className="bg-slate-100/80 rounded-2xl p-3 text-[10px] text-slate-500 leading-relaxed text-center">
        Les investissements sur InvestCI sont soumis aux durées contractuelles de chaque produit (3 à 90 jours). Frais de retrait fixes de 6% appliqués automatiquement sur chaque demande de retrait.
      </div>
    </div>
  );
};
