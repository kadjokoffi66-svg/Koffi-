import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethodType, Transaction } from '../types';
import { formatFCFA, formatDateFR } from '../utils/formatters';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Copy, 
  Check, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ShieldCheck,
  Phone,
  Receipt,
  Smartphone,
  ChevronRight,
  Filter,
  ExternalLink
} from 'lucide-react';

const PRESET_AMOUNTS = [2000, 5000, 10000, 20000, 50000, 100000];

export const TransactionsTab: React.FC = () => {
  const { 
    user, 
    transactions, 
    config, 
    deposit, 
    withdraw, 
    showToast 
  } = useApp();

  const [subTab, setSubTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');

  // Deposit Form State
  const [depositMethod, setDepositMethod] = useState<PaymentMethodType>('Wave');
  const [depositAmount, setDepositAmount] = useState<number>(5000);
  const [customDeposit, setCustomDeposit] = useState<string>('');
  const [senderPhone, setSenderPhone] = useState<string>(user?.phoneNumber || '');
  const [txRef, setTxRef] = useState<string>('');
  const [copiedDepNumber, setCopiedDepNumber] = useState(false);
  const [isDepositSubmitting, setIsDepositSubmitting] = useState(false);

  // Withdraw Form State
  const [withdrawMethod, setWithdrawMethod] = useState<PaymentMethodType>('Wave');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('5000');
  const [receiverPhone, setReceiverPhone] = useState<string>(user?.phoneNumber || '');
  const [receiverName, setReceiverName] = useState<string>(user?.fullName || '');
  const [withdrawPin, setWithdrawPin] = useState<string>('');
  const [isWithdrawSubmitting, setIsWithdrawSubmitting] = useState(false);

  // History Filter
  const [historyFilter, setHistoryFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'return' | 'referral_bonus'>('all');

  const currentAmt = customDeposit ? parseInt(customDeposit, 10) || depositAmount : depositAmount;
  const isDepositWave = depositMethod === 'Wave';
  const waveDirectLink = config.waveMerchantPaymentUrl 
    ? `${config.waveMerchantPaymentUrl}${currentAmt}`
    : `https://pay.wave.com/m/M_ci_gwspWhhPWE3G/c/ci/?amount=${currentAmt}`;

  let currentOfficialNumber = config.officialWaveNumber;
  if (depositMethod === 'MTN Money') {
    currentOfficialNumber = config.officialMtnNumber || '+225 05 76 14 02 20';
  } else if (depositMethod === 'Moov Money') {
    currentOfficialNumber = config.officialMoovNumber || '+225 01 00 61 08 06';
  } else if (depositMethod === 'Wave') {
    currentOfficialNumber = config.waveMerchantPaymentUrl || 'https://pay.wave.com/m/M_ci_gwspWhhPWE3G/c/ci/?amount=';
  }

  const copyOfficialNumber = () => {
    const num = currentOfficialNumber;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(num);
    }
    setCopiedDepNumber(true);
    setTimeout(() => setCopiedDepNumber(false), 2000);
    showToast(`${isDepositWave ? 'Lien Marchand Wave' : `Numéro officiel ${depositMethod}`} copié dans le presse-papier !`, 'success');
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = customDeposit ? parseInt(customDeposit, 10) : depositAmount;
    if (!amount || isNaN(amount) || amount < config.minDeposit) {
      showToast(`Le montant minimum de dépôt est de ${formatFCFA(config.minDeposit)}`, 'error');
      return;
    }

    if (!senderPhone.trim()) {
      showToast('Veuillez entrer votre numéro de téléphone d\'envoi', 'error');
      return;
    }

    setIsDepositSubmitting(true);
    const res = await deposit(amount, depositMethod, senderPhone, txRef);
    setIsDepositSubmitting(false);

    if (res.success) {
      setCustomDeposit('');
      setTxRef('');
      setSubTab('history');
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(withdrawAmount, 10);
    if (!amount || isNaN(amount) || amount < config.minWithdrawal) {
      showToast(`Le montant minimum de retrait est de ${formatFCFA(config.minWithdrawal)}`, 'error');
      return;
    }

    if (amount > user.balance) {
      showToast(`Solde insuffisant (${formatFCFA(user.balance)})`, 'error');
      return;
    }

    if (!receiverPhone.trim() || !receiverName.trim()) {
      showToast('Veuillez renseigner le nom et numéro du destinataire', 'error');
      return;
    }

    if (!withdrawPin.trim()) {
      showToast('Veuillez entrer votre code PIN de sécurité (par défaut : 1234)', 'error');
      return;
    }

    setIsWithdrawSubmitting(true);
    const res = await withdraw(amount, withdrawMethod, receiverPhone, receiverName, withdrawPin);
    setIsWithdrawSubmitting(false);

    if (res.success) {
      setWithdrawPin('');
      setSubTab('history');
    }
  };

  const txList = Array.isArray(transactions) ? transactions : [];
  const filteredHistory = txList.filter((tx) => {
    if (!tx) return false;
    if (historyFilter === 'all') return true;
    return tx.type === historyFilter;
  });

  return (
    <div className="space-y-4 pb-20 pt-1">
      {/* Top Navigation for Transactions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-1.5 flex items-center shadow-xs">
        <button
          onClick={() => setSubTab('deposit')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
            subTab === 'deposit'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5" />
          <span>Recharger / Dépôt</span>
        </button>

        <button
          onClick={() => setSubTab('withdraw')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
            subTab === 'withdraw'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Retirer</span>
        </button>

        <button
          onClick={() => setSubTab('history')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
            subTab === 'history'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Historique</span>
        </button>
      </div>

      {/* Sub-tab 1: DÉPÔT / RECHARGE */}
      {subTab === 'deposit' && (
        <div className="space-y-4">
          {/* Method Selection (Wave vs MTN Money vs Moov Money) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">1. Choisissez le moyen de paiement</h3>

            <div className="grid grid-cols-3 gap-2">
              {/* Wave */}
              <button
                type="button"
                onClick={() => setDepositMethod('Wave')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  depositMethod === 'Wave'
                    ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-sky-500 text-white font-black text-xs flex items-center justify-center shadow-xs mb-1.5">
                  W
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs">Wave</h4>
                  <p className="text-[10px] text-sky-600 font-bold">Lien Marchand</p>
                </div>
              </button>

              {/* MTN Money */}
              <button
                type="button"
                onClick={() => setDepositMethod('MTN Money')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  depositMethod === 'MTN Money'
                    ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs mb-1.5">
                  MTN
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs">MTN Money</h4>
                  <p className="text-[10px] text-amber-700 font-bold">Instantané</p>
                </div>
              </button>

              {/* Moov Money */}
              <button
                type="button"
                onClick={() => setDepositMethod('Moov Money')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  depositMethod === 'Moov Money'
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs mb-1.5">
                  M
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs">Moov</h4>
                  <p className="text-[10px] text-emerald-600 font-bold">Sans frais</p>
                </div>
              </button>
            </div>
          </div>

          {/* Official Merchant Number Display Box */}
          <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold tracking-wider text-blue-200 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                {isDepositWave ? 'Paiement Marchand Wave' : `Numéro Marchand Officiel (${depositMethod})`}
              </span>
              <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {depositMethod}
              </span>
            </div>

            {isDepositWave ? (
              <div className="space-y-2.5">
                <a
                  href={waveDirectLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-sky-400 hover:bg-sky-300 text-slate-950 font-black py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all active:scale-98 text-xs"
                >
                  <span>Payer directement avec Wave ({formatFCFA(currentAmt)})</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 flex items-center justify-between">
                  <div className="min-w-0 flex-1 mr-2">
                    <span className="text-[10px] text-blue-200 block">Lien de paiement Wave :</span>
                    <p className="font-mono text-xs text-white truncate">
                      {waveDirectLink}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={copyOfficialNumber}
                    className="bg-white text-blue-800 hover:bg-blue-50 active:scale-95 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1 shadow-sm transition-all shrink-0"
                  >
                    {copiedDepNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDepNumber ? 'Copié' : 'Copier lien'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-200 block">Effectuez le transfert vers ce numéro :</span>
                  <p className="font-mono text-lg font-black tracking-wider text-white">
                    {currentOfficialNumber}
                  </p>
                  <span className="text-[11px] text-emerald-300 font-semibold">
                    Nom : {config.merchantName}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={copyOfficialNumber}
                  className="bg-white text-blue-800 hover:bg-blue-50 active:scale-95 px-3 py-2 rounded-xl font-bold text-xs flex items-center space-x-1 shadow-sm transition-all"
                >
                  {copiedDepNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDepNumber ? 'Copié' : 'Copier'}</span>
                </button>
              </div>
            )}

            <p className="text-[11px] text-blue-100 leading-tight">
              {isDepositWave 
                ? 'Cliquez sur le bouton pour ouvrir l\'application Wave et valider votre paiement en un clic.'
                : `1. Ouvrez votre application ${depositMethod}.\n2. Transférez le montant au ${currentOfficialNumber}.\n3. Renseignez les détails ci-dessous pour confirmation immédiate.`}
            </p>
          </div>

          {/* Deposit Form */}
          <form onSubmit={handleDepositSubmit} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
            {/* Amount Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                2. Montant du dépôt (FCFA)
              </label>

              <div className="grid grid-cols-3 gap-2">
                {PRESET_AMOUNTS.map((amt) => {
                  const isSelected = !customDeposit && depositAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setDepositAmount(amt);
                        setCustomDeposit('');
                      }}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {formatFCFA(amt)}
                    </button>
                  );
                })}
              </div>

              <div className="pt-1">
                <input
                  type="number"
                  placeholder="Ou saisir un autre montant (ex: 75 000)"
                  value={customDeposit}
                  onChange={(e) => setCustomDeposit(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Sender Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 block">
                3. Votre numéro de téléphone {depositMethod}
              </label>
              <input
                type="tel"
                required
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                placeholder="+225 07 00 00 00 00"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-blue-500 font-medium"
              />
            </div>

            {/* SMS Reference / Transaction ID */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 block">
                4. ID de transaction / Référence SMS (Optionnel)
              </label>
              <input
                type="text"
                value={txRef}
                onChange={(e) => setTxRef(e.target.value)}
                placeholder="Ex: WV-829103 ou Ref SMS Moov"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-blue-500 font-mono"
              />
              <p className="text-[10px] text-slate-400">
                Permet d'accélérer la vérification de votre recharge.
              </p>
            </div>

            <button
              type="submit"
              disabled={isDepositSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white font-extrabold py-3 rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>
                {isDepositSubmitting ? 'Traitement en cours...' : `Confirmer le Dépôt de ${formatFCFA(customDeposit ? parseInt(customDeposit, 10) || 0 : depositAmount)}`}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* Sub-tab 2: RETRAIT (WITHDRAWAL) */}
      {subTab === 'withdraw' && (
        <div className="space-y-4">
          {/* Available balance banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 shadow-md space-y-1">
            <span className="text-[11px] text-blue-200 font-medium uppercase tracking-wider">
              Solde Retirable Disponible
            </span>
            <div className="text-2xl font-black text-amber-300">
              {formatFCFA(user.balance)}
            </div>
            <p className="text-[11px] text-slate-300">
              Retrait direct sans délai vers votre compte Wave ou Moov Money.
            </p>
          </div>

          <form onSubmit={handleWithdrawSubmit} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
            {/* Choose Method */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                1. Moyen de réception du retrait
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setWithdrawMethod('Wave')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    withdrawMethod === 'Wave'
                      ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-sky-500 text-white font-black text-xs flex items-center justify-center mb-1">
                    W
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Wave</h4>
                    <p className="text-[10px] text-slate-500">0% de frais</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setWithdrawMethod('MTN Money')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    withdrawMethod === 'MTN Money'
                      ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center mb-1">
                    MTN
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">MTN Money</h4>
                    <p className="text-[10px] text-slate-500">Instantané</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setWithdrawMethod('Moov Money')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    withdrawMethod === 'Moov Money'
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-1">
                    M
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Moov</h4>
                    <p className="text-[10px] text-slate-500">0% de frais</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Withdraw Amount */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <label>2. Montant à retirer (FCFA)</label>
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(user.balance.toString())}
                  className="text-blue-600 hover:text-blue-700 font-bold text-[11px]"
                >
                  Tout retirer ({formatFCFA(user.balance)})
                </button>
              </div>
              <input
                type="number"
                required
                min={config.minWithdrawal}
                max={user.balance}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Montant (min: 1 000 FCFA)"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-blue-500 font-bold text-slate-900"
              />
              
              {/* Fee Breakdown (6%) */}
              {(() => {
                const wAmt = parseInt(withdrawAmount, 10) || 0;
                const feeAmt = Math.round(wAmt * ((config.withdrawalFeePercent || 6) / 100));
                const netAmt = Math.max(0, wAmt - feeAmt);
                return (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Montant demandé :</span>
                      <span className="font-mono font-bold text-slate-900">{formatFCFA(wAmt)}</span>
                    </div>
                    <div className="flex justify-between text-amber-700 font-medium">
                      <span>Frais de retrait fixes (6%) :</span>
                      <span className="font-mono font-black">- {formatFCFA(feeAmt)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 font-black text-slate-900">
                      <span>Montant net à recevoir :</span>
                      <span className="font-mono text-emerald-600 text-sm">{formatFCFA(netAmt)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Recipient Phone & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">
                  3. Numéro de réception {withdrawMethod}
                </label>
                <input
                  type="tel"
                  required
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  placeholder="+225 07 00 00 00 00"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">
                  4. Nom du titulaire du compte
                </label>
                <input
                  type="text"
                  required
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="Nom et Prénoms"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Security PIN Code */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 block">
                5. Code PIN de Sécurité (4 chiffres)
              </label>
              <input
                type="password"
                maxLength={4}
                required
                value={withdrawPin}
                onChange={(e) => setWithdrawPin(e.target.value)}
                placeholder="Code PIN (ex: 1234)"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-blue-500 font-mono tracking-widest text-center"
              />
              <p className="text-[10px] text-slate-400 text-center">
                Code PIN par défaut pour le test : <strong className="text-slate-700">1234</strong> (modifiable dans l'onglet Compte)
              </p>
            </div>

            <button
              type="submit"
              disabled={isWithdrawSubmitting || user.balance < config.minWithdrawal}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 active:scale-98 text-white font-extrabold py-3 rounded-xl text-sm shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <span>
                {isWithdrawSubmitting ? 'Traitement du retrait...' : `Confirmer le Retrait de ${formatFCFA(parseInt(withdrawAmount, 10) || 0)}`}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* Sub-tab 3: HISTORIQUE DES TRANSACTIONS */}
      {subTab === 'history' && (
        <div className="space-y-3">
          {/* History filter buttons */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
            <button
              onClick={() => setHistoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                historyFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setHistoryFilter('deposit')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                historyFilter === 'deposit'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Dépôts
            </button>
            <button
              onClick={() => setHistoryFilter('withdrawal')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                historyFilter === 'withdrawal'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Retraits
            </button>
            <button
              onClick={() => setHistoryFilter('return')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                historyFilter === 'return'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Gains Plans
            </button>
            <button
              onClick={() => setHistoryFilter('referral_bonus')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                historyFilter === 'referral_bonus'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Parrainage
            </button>
          </div>

          {/* Transactions List */}
          {filteredHistory.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500">
              Aucune transaction enregistrée dans cette catégorie.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredHistory.map((tx) => {
                const isPositive = tx.type === 'deposit' || tx.type === 'return' || tx.type === 'referral_bonus' || tx.type === 'daily_bonus';

                return (
                  <div
                    key={tx.id}
                    className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.type === 'deposit'
                            ? 'bg-blue-50 text-blue-600'
                            : tx.type === 'withdrawal'
                            ? 'bg-purple-50 text-purple-600'
                            : tx.type === 'return'
                            ? 'bg-emerald-50 text-emerald-600'
                            : tx.type === 'referral_bonus'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-slate-50 text-slate-600'
                        }`}
                      >
                        {tx.type === 'deposit' && <ArrowDownLeft className="w-5 h-5" />}
                        {tx.type === 'withdrawal' && <ArrowUpRight className="w-5 h-5" />}
                        {tx.type === 'return' && <CheckCircle2 className="w-5 h-5" />}
                        {tx.type === 'referral_bonus' && <Receipt className="w-5 h-5" />}
                        {tx.type === 'daily_bonus' && <CheckCircle2 className="w-5 h-5" />}
                        {tx.type === 'investment' && <ArrowUpRight className="w-5 h-5 text-blue-600" />}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-900 text-xs">
                            {tx.type === 'deposit' && `Dépôt ${tx.method || ''}`}
                            {tx.type === 'withdrawal' && `Retrait ${tx.method || ''}`}
                            {tx.type === 'investment' && 'Souscription Plan'}
                            {tx.type === 'return' && 'Gain Quotidien'}
                            {tx.type === 'referral_bonus' && 'Commission Parrainage'}
                            {tx.type === 'daily_bonus' && 'Cadeau Quotidien'}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              tx.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700'
                                : tx.status === 'pending'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {tx.status === 'completed' ? 'Validé' : tx.status === 'pending' ? 'En attente' : 'Rejeté'}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 max-w-[200px] sm:max-w-xs truncate">
                          {tx.description}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {formatDateFR(tx.createdAt)}
                          {tx.referenceId && ` • Ref: ${tx.referenceId}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-black text-xs ${
                          isPositive ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {isPositive ? '+' : '-'}{formatFCFA(tx.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
