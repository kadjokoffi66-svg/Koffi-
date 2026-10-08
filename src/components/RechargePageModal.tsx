import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethodType } from '../types';
import { formatFCFA } from '../utils/formatters';
import { 
  ArrowLeft, 
  History, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  CreditCard 
} from 'lucide-react';

const QUICK_AMOUNTS = [
  2000, 5000, 10000, 25000, 
  50000, 100000, 250000, 500000, 1000000
];

export const RechargePageModal: React.FC = () => {
  const { 
    isDepositModalOpen, 
    setIsDepositModalOpen, 
    user, 
    config, 
    deposit, 
    showToast,
    setActiveTab 
  } = useApp();

  const [selectedAmount, setSelectedAmount] = useState<number>(2000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('Wave');
  const [senderPhone, setSenderPhone] = useState<string>(user?.phoneNumber || '');
  const [txRef, setTxRef] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isDepositModalOpen) return null;

  const currentAmt = customAmount ? parseInt(customAmount, 10) || selectedAmount : selectedAmount;
  const isWave = paymentMethod === 'Wave';
  const waveDirectLink = config.waveMerchantPaymentUrl 
    ? `${config.waveMerchantPaymentUrl}${currentAmt}`
    : `https://pay.wave.com/m/M_ci_gwspWhhPWE3G/c/ci/?amount=${currentAmt}`;

  let targetNumber = config.officialWaveNumber;
  if (paymentMethod === 'MTN Money') {
    targetNumber = config.officialMtnNumber || '+225 05 76 14 02 20';
  } else if (paymentMethod === 'Moov Money') {
    targetNumber = config.officialMoovNumber || '+225 01 00 61 08 06';
  } else if (paymentMethod === 'Wave') {
    targetNumber = config.waveMerchantPaymentUrl || 'https://pay.wave.com/m/M_ci_gwspWhhPWE3G/c/ci/?amount=';
  }

  const copyNumber = () => {
    navigator.clipboard.writeText(targetNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast(`${isWave ? 'Lien Marchand Wave' : `Numéro ${paymentMethod}`} copié !`, 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAmt || currentAmt < config.minDeposit) {
      showToast(`Le montant minimum est de ${formatFCFA(config.minDeposit)}`, 'error');
      return;
    }

    if (!senderPhone.trim()) {
      showToast('Veuillez renseigner votre numéro de téléphone', 'error');
      return;
    }

    setLoading(true);
    const res = await deposit(currentAmt, paymentMethod, senderPhone, txRef);
    setLoading(false);

    if (res.success) {
      setIsDepositModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-50 w-full max-w-md h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header - Blue style matching Screenshot 6 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 pt-6 flex items-center justify-between shadow-md">
          <button
            onClick={() => setIsDepositModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <h2 className="text-base font-extrabold text-white lowercase first-letter:uppercase tracking-wide">
            recharger
          </h2>

          <button
            onClick={() => {
              setIsDepositModalOpen(false);
              setActiveTab('transactions');
            }}
            className="text-[11px] font-bold bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span>Historique &gt;</span>
          </button>
        </div>

        {/* Balance Display banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 pb-5 -mt-1 shadow-inner">
          <span className="text-[11px] text-blue-100 font-medium block">Solde</span>
          <p className="text-2xl font-black tracking-tight text-white mt-0.5">
            FCFA{(user?.balance ?? 0).toFixed(2)}
          </p>
        </div>

        {/* White curved content card */}
        <div className="flex-1 bg-white rounded-t-3xl -mt-3 p-4 space-y-4 overflow-y-auto shadow-md">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input field */}
            <div>
              <label className="text-xs font-black text-slate-800 block mb-2">
                Montant du rechargement
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="FCFA Montant du rechargement"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500 placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Quick Circular Pill Buttons like Screenshot 6 */}
            <div>
              <label className="text-xs font-black text-slate-800 block mb-2.5">
                Montants rapides
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {QUICK_AMOUNTS.map((amt) => {
                  const isSelected = !customAmount && selectedAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`h-14 rounded-full border flex items-center justify-center text-[11px] font-bold transition-all shadow-xs ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 text-blue-700 ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {amt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Method selection (Wave, MTN Money, Moov) */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <label className="text-xs font-black text-slate-800 block">
                Moyen de paiement
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Wave')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    paymentMethod === 'Wave'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold ring-2 ring-blue-500/20'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="text-xs block">Wave</span>
                  <span className="text-[10px] text-sky-600 font-bold">1-Clic</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('MTN Money')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    paymentMethod === 'MTN Money'
                      ? 'border-amber-500 bg-amber-50 text-amber-800 font-bold ring-2 ring-amber-500/20'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="text-xs block">MTN</span>
                  <span className="text-[10px] text-amber-700 font-bold">0576140220</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Moov Money')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    paymentMethod === 'Moov Money'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="text-xs block">Moov</span>
                  <span className="text-[10px] text-emerald-700 font-bold">Instantané</span>
                </button>
              </div>
            </div>

            {/* Payment details box */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-3.5 space-y-2">
              <span className="text-[10px] text-blue-200 uppercase font-bold block">
                {isWave ? 'Paiement Marchand Wave' : `Numéro Officiel (${paymentMethod})`}
              </span>

              {isWave ? (
                <div className="space-y-2">
                  <a
                    href={waveDirectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-sky-400 hover:bg-sky-300 text-slate-950 font-black py-2.5 px-3 rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all active:scale-98 text-xs"
                  >
                    <span>Payer directement avec Wave ({formatFCFA(currentAmt)})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <div className="bg-white/10 rounded-xl p-2 flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-blue-100 truncate max-w-[200px]">
                      {waveDirectLink}
                    </span>
                    <button
                      type="button"
                      onClick={copyNumber}
                      className="bg-white text-blue-800 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 shrink-0 ml-2"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copié' : 'Copier lien'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white/10 rounded-xl p-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-blue-200 block">Transférez au :</span>
                    <span className="font-mono font-black text-white text-base">
                      {targetNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={copyNumber}
                    className="bg-white text-blue-800 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copié' : 'Copier'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Phone & SMS ref */}
            <div className="space-y-2 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Votre numéro d'envoi</label>
                <input
                  type="tel"
                  required
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">ID Transaction / Réf SMS (Optionnel)</label>
                <input
                  type="text"
                  value={txRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  placeholder="Ex: WV-829103"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-hidden"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-3 rounded-2xl text-sm shadow-md transition-all active:scale-98"
            >
              {loading ? 'Validation en cours...' : `Confirmer le rechargement de ${formatFCFA(currentAmt)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
