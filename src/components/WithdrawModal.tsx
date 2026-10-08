import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethodType } from '../types';
import { formatFCFA } from '../utils/formatters';
import { 
  X, 
  ArrowUpRight, 
  ShieldCheck, 
  AlertCircle, 
  Wallet, 
  Lock, 
  Info,
  CheckCircle2,
  Receipt
} from 'lucide-react';

export const WithdrawModal: React.FC = () => {
  const { 
    isWithdrawModalOpen, 
    setIsWithdrawModalOpen, 
    user, 
    withdraw, 
    config, 
    showToast,
    setActiveTab 
  } = useApp();

  const [method, setMethod] = useState<PaymentMethodType>('Wave');
  const [amount, setAmount] = useState<string>('10000');
  const [receiverPhone, setReceiverPhone] = useState<string>(user?.phoneNumber || '');
  const [receiverName, setReceiverName] = useState<string>(user?.fullName || '');
  const [pin, setPin] = useState<string>('1234');
  const [loading, setLoading] = useState(false);

  if (!isWithdrawModalOpen) return null;

  const numAmount = parseInt(amount, 10) || 0;
  // Automatic calculation of 6% fee (Section 16 of specs)
  const feePercent = config.withdrawalFeePercent || 6;
  const fee = Math.round(numAmount * (feePercent / 100));
  const netAmount = Math.max(0, numAmount - fee);

  const hasEnoughBalance = user.balance >= numAmount && numAmount >= config.minWithdrawal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numAmount || isNaN(numAmount) || numAmount < config.minWithdrawal) {
      showToast(`Le montant minimum de retrait est de ${formatFCFA(config.minWithdrawal)}`, 'error');
      return;
    }

    if (numAmount > user.balance) {
      showToast('Solde disponible insuffisant pour effectuer ce retrait', 'error');
      return;
    }

    if (!receiverPhone.trim()) {
      showToast('Veuillez renseigner le numéro de réception', 'error');
      return;
    }

    if (!pin.trim()) {
      showToast('Entrez votre code PIN de sécurité (par défaut: 1234)', 'error');
      return;
    }

    setLoading(true);
    const res = await withdraw(numAmount, method, receiverPhone, receiverName, pin);
    setLoading(false);

    if (res.success) {
      setIsWithdrawModalOpen(false);
      setActiveTab('history');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 border border-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Demande de Retrait
              </h3>
              <p className="text-[11px] text-slate-500">Vers Wave, MTN Money ou Moov Money</p>
            </div>
          </div>

          <button
            onClick={() => setIsWithdrawModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Balance Display */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between text-xs">
          <span className="text-slate-600 flex items-center gap-1.5 font-medium">
            <Wallet className="w-4 h-4 text-blue-600" />
            Solde disponible :
          </span>
          <span className="font-mono font-black text-slate-900 text-sm">
            {formatFCFA(user.balance)}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Operator Method Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 block">
              1. Moyen de retrait
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('Wave')}
                className={`py-2.5 px-2 rounded-xl border text-center transition-all ${
                  method === 'Wave'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold ring-2 ring-blue-500/20'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs block font-bold">Wave</span>
                <span className="text-[10px] text-sky-600">Instantané</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('MTN Money')}
                className={`py-2.5 px-2 rounded-xl border text-center transition-all ${
                  method === 'MTN Money'
                    ? 'border-amber-500 bg-amber-50 text-amber-800 font-bold ring-2 ring-amber-500/20'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs block font-bold">MTN Money</span>
                <span className="text-[10px] text-amber-700">CI</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('Moov Money')}
                className={`py-2.5 px-2 rounded-xl border text-center transition-all ${
                  method === 'Moov Money'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs block font-bold">Moov Money</span>
                <span className="text-[10px] text-emerald-700">Flooz</span>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800">
                2. Montant du retrait (min: {formatFCFA(config.minWithdrawal)})
              </label>
              <button
                type="button"
                onClick={() => setAmount(user.balance.toString())}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700"
              >
                Tout retirer ({formatFCFA(user.balance)})
              </button>
            </div>
            <input
              type="number"
              required
              min={config.minWithdrawal}
              max={user.balance}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-blue-500 font-bold text-slate-900"
              placeholder="Ex: 10 000"
            />
          </div>

          {/* EXACT 6% FEE CALCULATION BREAKDOWN (Section 16 of specs) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Montant demandé :</span>
              <span className="font-mono font-bold text-slate-900">
                {formatFCFA(numAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200 font-medium">
              <span className="flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5" />
                Frais de retrait fixes (6%) :
              </span>
              <span className="font-mono font-black">
                - {formatFCFA(fee)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-sm font-black">
              <span className="text-slate-900">Montant net que vous recevrez :</span>
              <span className="font-mono text-emerald-600 text-base">
                {formatFCFA(netAmount)}
              </span>
            </div>
          </div>

          {/* Recipient Details */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block text-[11px]">
                Numéro de réception
              </label>
              <input
                type="tel"
                required
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
                placeholder="+225 05 00 00 00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block text-[11px]">
                Nom du titulaire
              </label>
              <input
                type="text"
                required
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="Nom complet"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden font-medium"
              />
            </div>
          </div>

          {/* Security PIN */}
          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-700 block text-[11px]">
              Code PIN de sécurité (4 chiffres)
            </label>
            <input
              type="password"
              required
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Code PIN (1234 par défaut)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden font-mono tracking-widest text-center"
            />
            <p className="text-[10px] text-slate-400 text-center">
              Code PIN par défaut : <strong>1234</strong> (modifiable dans l'onglet Compte)
            </p>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading || !hasEnoughBalance}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 active:scale-98 text-white font-extrabold py-3.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span>
              {loading 
                ? 'Traitement de la demande...' 
                : `Confirmer le Retrait Net de ${formatFCFA(netAmount)}`}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
