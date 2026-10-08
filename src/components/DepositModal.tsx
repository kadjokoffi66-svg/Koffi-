import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethodType } from '../types';
import { formatFCFA } from '../utils/formatters';
import { 
  X, 
  ArrowDownLeft, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles,
  Smartphone,
  ExternalLink
} from 'lucide-react';

const PRESET_AMOUNTS = [2000, 5000, 10000, 20000, 50000, 100000];

export const DepositModal: React.FC = () => {
  const { 
    isDepositModalOpen, 
    setIsDepositModalOpen, 
    config, 
    deposit, 
    user, 
    showToast 
  } = useApp();

  const [method, setMethod] = useState<PaymentMethodType>('Wave');
  const [amount, setAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [senderPhone, setSenderPhone] = useState<string>(user.phoneNumber);
  const [txRef, setTxRef] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isDepositModalOpen) return null;

  const currentAmt = customAmount ? parseInt(customAmount, 10) || amount : amount;
  const isWave = method === 'Wave';
  const waveDirectLink = config.waveMerchantPaymentUrl 
    ? `${config.waveMerchantPaymentUrl}${currentAmt}`
    : `https://pay.wave.com/m/M_ci_gwspWhhPWE3G/c/ci/?amount=${currentAmt}`;

  let targetNumber = config.officialWaveNumber;
  if (method === 'MTN Money') {
    targetNumber = config.officialMtnNumber || '+225 05 76 14 02 20';
  } else if (method === 'Moov Money') {
    targetNumber = config.officialMoovNumber || '+225 01 00 61 08 06';
  } else if (method === 'Wave') {
    targetNumber = config.waveMerchantPaymentUrl || 'https://pay.wave.com/m/M_ci_gwspWhhPWE3G/c/ci/?amount=';
  }

  const copyNumber = () => {
    navigator.clipboard.writeText(targetNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast(`${isWave ? 'Lien Marchand Wave' : `Numéro ${method}`} copié !`, 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmt = customAmount ? parseInt(customAmount, 10) : amount;
    if (!finalAmt || isNaN(finalAmt) || finalAmt < config.minDeposit) {
      showToast(`Le montant minimum est de ${formatFCFA(config.minDeposit)}`, 'error');
      return;
    }

    if (!senderPhone.trim()) {
      showToast('Veuillez renseigner votre numéro', 'error');
      return;
    }

    setLoading(true);
    const res = await deposit(finalAmt, method, senderPhone, txRef);
    setLoading(false);

    if (res.success) {
      setIsDepositModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Recharger mon Compte</h3>
              <p className="text-[11px] text-slate-500">Dépôt instantané Wave & Moov</p>
            </div>
          </div>
          <button
            onClick={() => setIsDepositModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Method selection */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => setMethod('Wave')}
            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
              method === 'Wave'
                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-sky-500 text-white font-black text-xs flex items-center justify-center mb-1">
              W
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Wave</h4>
              <p className="text-[10px] text-sky-600 font-bold">Lien Marchand</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMethod('MTN Money')}
            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
              method === 'MTN Money'
                ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center mb-1">
              MTN
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">MTN Money</h4>
              <p className="text-[10px] text-amber-700 font-bold">0% frais</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMethod('Moov Money')}
            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
              method === 'Moov Money'
                ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-1">
              M
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Moov</h4>
              <p className="text-[10px] text-emerald-600 font-bold">Instantané</p>
            </div>
          </button>
        </div>

        {/* Number or Link to pay */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-blue-200 uppercase font-bold block">
              {isWave ? 'Paiement Marchand Wave Officiel' : `Numéro Officiel (${method})`}
            </span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
              {method}
            </span>
          </div>

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
                <span className="text-[10px] text-blue-200 block">Effectuez le dépôt vers :</span>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">Montant à recharger</label>
            <div className="grid grid-cols-3 gap-1.5 mb-1.5">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`py-1.5 rounded-lg font-bold text-[11px] ${
                    !customAmount && amount === amt
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {formatFCFA(amt)}
                </button>
              ))}
            </div>
            <input
              type="number"
              placeholder="Autre montant..."
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden font-medium"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Votre numéro {method}</label>
            <input
              type="tel"
              required
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden font-medium"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">ID de Transaction / SMS (Optionnel)</label>
            <input
              type="text"
              value={txRef}
              onChange={(e) => setTxRef(e.target.value)}
              placeholder="Ex: WV-829103"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-3 rounded-2xl text-sm shadow-md transition-all active:scale-98"
          >
            {loading ? 'Validation en cours...' : `Valider le Dépôt de ${formatFCFA(customAmount ? parseInt(customAmount, 10) || 0 : amount)}`}
          </button>
        </form>
      </div>
    </div>
  );
};
