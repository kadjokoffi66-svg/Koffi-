import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, formatDateFR } from '../utils/formatters';
import { 
  X, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Wallet,
  Calendar
} from 'lucide-react';

export const InvestModal: React.FC = () => {
  const { 
    isInvestModalOpen, 
    setIsInvestModalOpen, 
    selectedPlanForModal, 
    user, 
    investInPlan,
    setIsDepositModalOpen,
    setActiveTab
  } = useApp();

  const [selectedAmount, setSelectedAmount] = useState<number>(2000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedPlanForModal) {
      setSelectedAmount(selectedPlanForModal.minAmount || 2000);
      setCustomAmount('');
    }
  }, [selectedPlanForModal]);

  if (!isInvestModalOpen || !selectedPlanForModal) return null;

  const plan = selectedPlanForModal;
  const currentAmt = customAmount ? parseInt(customAmount, 10) || selectedAmount : selectedAmount;

  // Real-time calculation
  const totalReturn = Math.round(currentAmt + currentAmt * (plan.totalReturnRatePercent / 100));
  const netProfit = totalReturn - currentAmt;
  const dailyGain = Math.round(netProfit / plan.durationDays);

  const hasEnoughFunds = user.balance >= currentAmt;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasEnoughFunds) {
      setIsInvestModalOpen(false);
      setIsDepositModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    const res = await investInPlan(plan.id, currentAmt);
    setIsSubmitting(false);

    if (res.success) {
      setIsInvestModalOpen(false);
      setActiveTab('my-investments');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 border border-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-xs ${
              plan.category === 'fix' 
                ? 'bg-gradient-to-tr from-blue-600 to-indigo-700' 
                : 'bg-gradient-to-tr from-amber-500 to-orange-600'
            }`}>
              {plan.category === 'fix' ? '🔒' : '⚡'}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">
                Calculateur & Souscription
              </span>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                {plan.name}
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsInvestModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Balance Bar */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex items-center justify-between text-xs">
          <span className="text-slate-600 flex items-center gap-1.5 font-medium">
            <Wallet className="w-4 h-4 text-blue-600" />
            Votre solde disponible :
          </span>
          <span className="font-mono font-black text-slate-900 text-sm">
            {formatFCFA(user.balance)}
          </span>
        </div>

        <form onSubmit={handleConfirm} className="space-y-4">
          {/* Amount Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 block">
              1. Choisissez le montant d'investissement
            </label>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-3 gap-1.5">
              {(plan.availableAmounts || [2000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000]).map((amt) => {
                const isSelected = !customAmount && selectedAmount === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all text-center ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {amt >= 1000000 ? '1 000 000 F' : `${amt.toLocaleString('fr-FR')} F`}
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <div className="pt-1">
              <input
                type="number"
                min={plan.minAmount}
                max={plan.maxAmount}
                step={1000}
                placeholder="Ou saisissez un autre montant (min: 2 000 F)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-blue-500 font-bold text-slate-900 placeholder:font-normal"
              />
            </div>
          </div>

          {/* Calculator Output (Section 22 of specs) */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2">
              <span className="text-slate-600 font-medium">Durée du contrat :</span>
              <span className="font-extrabold text-slate-900 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                {plan.durationDays} Jours
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-blue-100 pb-2">
              <span className="text-slate-600 font-medium">Taux de rendement configuré :</span>
              <span className="font-mono font-black text-emerald-600">
                +{plan.totalReturnRatePercent}%
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-blue-100 pb-2">
              <span className="text-slate-600 font-medium">Gain estimé :</span>
              <span className="font-mono font-extrabold text-emerald-700">
                +{formatFCFA(netProfit)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <span className="font-black text-slate-900">Montant prévu à l'échéance :</span>
              <span className="font-mono font-black text-base text-blue-700">
                {formatFCFA(totalReturn)}
              </span>
            </div>
          </div>

          {/* Disclaimer & Risk transparency */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-600 leading-tight space-y-1">
            <div className="flex items-center gap-1 font-bold text-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Conditions d'investissement</span>
            </div>
            <p>
              Les fonds de {formatFCFA(currentAmt)} seront immédiatement mis en circulation pour {plan.durationDays} jours. À l'échéance, {formatFCFA(totalReturn)} seront automatiquement crédités sur votre solde disponible.
            </p>
          </div>

          {/* Action button */}
          {hasEnoughFunds ? (
            <button
              type="submit"
              disabled={isSubmitting || currentAmt < plan.minAmount}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>
                {isSubmitting
                  ? 'Activation en cours...'
                  : `Confirmer et Investir ${formatFCFA(currentAmt)}`}
              </span>
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Solde insuffisant ({formatFCFA(user.balance)} disponible pour {formatFCFA(currentAmt)} requis).
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsInvestModalOpen(false);
                  setIsDepositModalOpen(true);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <span>Effectuer un dépôt d'abord</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
