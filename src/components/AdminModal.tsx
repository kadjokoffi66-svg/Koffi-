import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, formatDateFR } from '../utils/formatters';
import { 
  X, 
  Wrench, 
  Users, 
  ArrowDownLeft, 
  ArrowUpRight, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw, 
  PlusCircle, 
  Smartphone,
  ShieldCheck,
  Zap,
  Edit2,
  Trash2,
  Calendar
} from 'lucide-react';
import { InvestmentPlan } from '../types';

export const AdminModal: React.FC = () => {
  const { 
    isAdminModalOpen, 
    setIsAdminModalOpen, 
    user, 
    plans, 
    investments, 
    transactions, 
    config, 
    approveTransaction, 
    rejectTransaction, 
    completeInvestmentManually,
    advanceTimeSimulation, 
    addTestFunds, 
    resetToDefaults, 
    updatePlatformConfig,
    updatePlan,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'deposits' | 'withdrawals' | 'investments' | 'products' | 'config'>('overview');

  // Config editor state
  const [waveUrl, setWaveUrl] = useState(config.waveMerchantPaymentUrl || config.officialWaveNumber);
  const [mtnNum, setMtnNum] = useState(config.officialMtnNumber);
  const [moovNum, setMoovNum] = useState(config.officialMoovNumber);
  const [supportNum, setSupportNum] = useState(config.whatsappSupportNumber);
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null);

  if (!isAdminModalOpen) return null;

  const pendingDeposits = transactions.filter((t) => t.type === 'deposit' && t.status === 'pending');
  const completedDeposits = transactions.filter((t) => t.type === 'deposit' && (t.status === 'completed' || t.status === 'confirmed'));
  const rejectedDeposits = transactions.filter((t) => t.type === 'deposit' && t.status === 'rejected');

  const pendingWithdrawals = transactions.filter((t) => t.type === 'withdrawal' && t.status === 'pending');
  const approvedWithdrawals = transactions.filter((t) => t.type === 'withdrawal' && (t.status === 'paid' || t.status === 'completed' || t.status === 'approved'));
  const rejectedWithdrawals = transactions.filter((t) => t.type === 'withdrawal' && t.status === 'rejected');

  const activeInvestments = investments.filter((i) => i.status === 'active');
  const completedInvestments = investments.filter((i) => i.status === 'completed');
  const totalInvestedAmount = investments.reduce((sum, i) => sum + i.investedAmount, 0);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatformConfig({
      waveMerchantPaymentUrl: waveUrl,
      officialWaveNumber: waveUrl,
      officialMtnNumber: mtnNum,
      officialMoovNumber: moovNum,
      whatsappSupportNumber: supportNum,
    });
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    updatePlan(editingPlan);
    setEditingPlan(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-white text-sm">Panneau Administrateur</h3>
                <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded">
                  ACCÈS TOTAL
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Gestion des utilisateurs, flux financiers et produits</p>
            </div>
          </div>

          <button
            onClick={() => setIsAdminModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-2 py-1.5 overflow-x-auto gap-1 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Vue globale</span>
          </button>

          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 relative ${
              activeTab === 'deposits' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-blue-600" />
            <span>Dépôts</span>
            {pendingDeposits.length > 0 && (
              <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full text-[9px] font-black">
                {pendingDeposits.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 relative ${
              activeTab === 'withdrawals' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            <span>Retraits (6%)</span>
            {pendingWithdrawals.length > 0 && (
              <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full text-[9px] font-black">
                {pendingWithdrawals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('investments')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'investments' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>En circulation ({activeInvestments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'products' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>Produits ({plans.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'config' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-teal-600" />
            <span>Numéros & Outils</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
                  <span className="text-blue-700 text-[10px] font-bold block">Solde Utilisateur</span>
                  <p className="font-mono font-black text-slate-900 text-sm mt-0.5">{formatFCFA(user.balance)}</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3">
                  <span className="text-indigo-700 text-[10px] font-bold block">Total Investi</span>
                  <p className="font-mono font-black text-slate-900 text-sm mt-0.5">{formatFCFA(totalInvestedAmount)}</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
                  <span className="text-amber-800 text-[10px] font-bold block">En Circulation</span>
                  <p className="font-mono font-black text-slate-900 text-sm mt-0.5">{activeInvestments.length} actif(s)</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
                  <span className="text-emerald-800 text-[10px] font-bold block">Total Retraits</span>
                  <p className="font-mono font-black text-slate-900 text-sm mt-0.5">{formatFCFA(user.totalWithdrawn)}</p>
                </div>
              </div>

              {/* User Account Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  Compte Utilisateur Connecté
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>Nom : <strong className="text-slate-800">{user.fullName}</strong></div>
                  <div>Téléphone : <strong className="text-slate-800">{user.phoneNumber}</strong></div>
                  <div>Rôle : <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">Investisseur</span></div>
                  <div>Statut : <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Actif</span></div>
                </div>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => addTestFunds(50000)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-xl text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Créditer 50 000 FCFA pour tester</span>
                  </button>
                </div>
              </div>

              {/* Time advancement tool (Simulation d'échéance) */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-indigo-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Simulateur Temporel (Test d'échéance automatique)
                  </h4>
                  <span className="text-[10px] text-indigo-600 font-bold">Section 13 du Cahier des Charges</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Avancez artificiellement le temps pour tester le passage de « EN CIRCULATION » à « TERMINÉ » et le versement automatique des fonds sur le solde.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => advanceTimeSimulation(1)}
                    className="bg-white border border-indigo-300 hover:bg-indigo-600 hover:text-white font-bold py-2 rounded-xl text-xs text-indigo-700 transition-colors"
                  >
                    +1 Jour
                  </button>
                  <button
                    onClick={() => advanceTimeSimulation(5)}
                    className="bg-white border border-indigo-300 hover:bg-indigo-600 hover:text-white font-bold py-2 rounded-xl text-xs text-indigo-700 transition-colors"
                  >
                    +5 Jours
                  </button>
                  <button
                    onClick={() => advanceTimeSimulation(30)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs transition-colors shadow-xs"
                  >
                    +30 Jours (Clôture)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEPOSITS */}
          {activeTab === 'deposits' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <h4 className="font-extrabold text-slate-900">Gestion des Dépôts ({transactions.filter((t) => t.type === 'deposit').length})</h4>
                <span className="text-slate-500">{pendingDeposits.length} en attente</span>
              </div>

              {pendingDeposits.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500 border border-slate-200">
                  Aucun dépôt en attente de validation.
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingDeposits.map((dep) => (
                    <div key={dep.id} className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-extrabold text-slate-900 text-sm">{formatFCFA(dep.amount)}</span>
                          <span className="text-[11px] text-slate-500 block">Via {dep.method} • {dep.phoneNumber}</span>
                        </div>
                        <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                          EN ATTENTE
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-mono">Réf: {dep.referenceId || 'N/A'} • {formatDateFR(dep.createdAt)}</p>
                      <div className="flex gap-2 pt-1 border-t border-amber-200/60">
                        <button
                          onClick={() => approveTransaction(dep.id)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirmer & Créditer le solde</span>
                        </button>
                        <button
                          onClick={() => rejectTransaction(dep.id)}
                          className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Refuser</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* History of completed deposits */}
              <div className="pt-2">
                <h5 className="font-bold text-xs text-slate-700 mb-2">Derniers dépôts confirmés</h5>
                <div className="space-y-1.5">
                  {completedDeposits.slice(0, 5).map((dep) => (
                    <div key={dep.id} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{formatFCFA(dep.amount)} ({dep.method})</span>
                        <span className="text-[10px] text-slate-400 block">{formatDateFR(dep.createdAt)}</span>
                      </div>
                      <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confirmé
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WITHDRAWALS (Section 16 & 17 of specs) */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <h4 className="font-extrabold text-slate-900">Demandes de Retraits (Frais 6%)</h4>
                <span className="text-slate-500">{pendingWithdrawals.length} en attente</span>
              </div>

              {pendingWithdrawals.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500 border border-slate-200">
                  Aucune demande de retrait en attente.
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingWithdrawals.map((wth) => (
                    <div key={wth.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-extrabold text-slate-900 text-sm">
                            Montant brut : {formatFCFA(wth.amount)}
                          </span>
                          <span className="text-[11px] text-emerald-700 font-bold block">
                            Net à payer (après -6%) : {formatFCFA(wth.netAmount || (wth.amount * 0.94))}
                          </span>
                        </div>
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                          EN ATTENTE
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-200">
                        <div>Bénéficiaire : <strong>{wth.accountName || user.fullName}</strong></div>
                        <div>Numéro : <strong>{wth.phoneNumber}</strong> ({wth.method})</div>
                        <div>Frais retenus (6%) : <strong>{formatFCFA(wth.fee || Math.round(wth.amount * 0.06))}</strong></div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => approveTransaction(wth.id)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Valider & Marquer Payé</span>
                        </button>
                        <button
                          onClick={() => rejectTransaction(wth.id)}
                          className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Refuser & Rembourser</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* History of paid withdrawals */}
              <div className="pt-2">
                <h5 className="font-bold text-xs text-slate-700 mb-2">Historique des retraits payés</h5>
                <div className="space-y-1.5">
                  {approvedWithdrawals.slice(0, 5).map((wth) => (
                    <div key={wth.id} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{formatFCFA(wth.amount)} (Net: {formatFCFA(wth.netAmount || wth.amount)})</span>
                        <span className="text-[10px] text-slate-400 block">{wth.phoneNumber} • {formatDateFR(wth.createdAt)}</span>
                      </div>
                      <span className="text-emerald-700 font-bold text-[11px]">Payé (6% frais déduits)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INVESTMENTS (Section 11 of specs) */}
          {activeTab === 'investments' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900">Investissements en circulation ({activeInvestments.length})</h4>
                <span className="text-blue-700 font-bold">Total : {formatFCFA(totalInvestedAmount)}</span>
              </div>

              {activeInvestments.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl text-center text-slate-500 border border-slate-200">
                  Aucun investissement en circulation actuellement.
                </div>
              ) : (
                <div className="space-y-2">
                  {activeInvestments.map((inv) => (
                    <div key={inv.id} className="bg-white border border-slate-200 rounded-2xl p-3 space-y-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-extrabold text-slate-900 text-sm">{inv.planName}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">ID: {inv.id} • {inv.durationDays} Jours</span>
                        </div>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                          🟢 EN CIRCULATION
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-xl text-center text-[11px]">
                        <div>
                          <span className="text-slate-400 text-[10px] block">Investi</span>
                          <strong>{formatFCFA(inv.investedAmount)}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Rendement</span>
                          <strong className="text-emerald-600">+{inv.returnRatePercent}%</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">À l'échéance</span>
                          <strong className="text-blue-700">{formatFCFA(inv.expectedTotalReturn)}</strong>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                        <span className="text-[11px] text-slate-500">
                          Échéance : {formatDateFR(inv.endDate)}
                        </span>
                        <button
                          onClick={() => completeInvestmentManually(inv.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded-lg text-[10px] flex items-center gap-1 transition-colors"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Liquider immédiatement</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PRODUCTS MANAGEMENT (Section 21 of specs) */}
          {activeTab === 'products' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900">Gestion des Produits (FIX & ACTIVITÉ)</h4>
                <span className="text-slate-500">{plans.length} configurés</span>
              </div>

              {editingPlan ? (
                <form onSubmit={handleSavePlan} className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-extrabold text-blue-900">Modifier le produit : {editingPlan.name}</h5>
                    <button
                      type="button"
                      onClick={() => setEditingPlan(null)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      Annuler
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nom affiché</label>
                      <input
                        type="text"
                        value={editingPlan.name}
                        onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Durée (en Jours)</label>
                      <input
                        type="number"
                        value={editingPlan.durationDays}
                        onChange={(e) => setEditingPlan({ ...editingPlan, durationDays: parseInt(e.target.value, 10) || 1 })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Rendement total (%)</label>
                      <input
                        type="number"
                        value={editingPlan.totalReturnRatePercent}
                        onChange={(e) => setEditingPlan({ ...editingPlan, totalReturnRatePercent: parseInt(e.target.value, 10) || 0 })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Montant Min (FCFA)</label>
                      <input
                        type="number"
                        value={editingPlan.minAmount}
                        onChange={(e) => setEditingPlan({ ...editingPlan, minAmount: parseInt(e.target.value, 10) || 2000 })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2.5 rounded-xl text-xs transition-colors"
                  >
                    Enregistrer les modifications
                  </button>
                </form>
              ) : null}

              <div className="space-y-2">
                {plans.map((p) => (
                  <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900">{p.name}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 rounded font-mono font-bold">
                          {p.durationDays}J
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Min: {formatFCFA(p.minAmount)} • Rendement: <strong className="text-emerald-600">+{p.totalReturnRatePercent}%</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => setEditingPlan(p)}
                      className="bg-white border border-slate-200 hover:bg-blue-50 text-blue-700 font-bold py-1 px-3 rounded-lg text-xs flex items-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Modifier</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CONFIG & NUMBERS */}
          {activeTab === 'config' && (
            <div className="space-y-4 text-xs">
              <form onSubmit={handleSaveConfig} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  Numéros et Liens Marchands Officiels
                </h4>

                <div className="space-y-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Lien Marchand Wave (1-Clic)
                    </label>
                    <input
                      type="url"
                      value={waveUrl}
                      onChange={(e) => setWaveUrl(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Numéro Officiel MTN Money
                    </label>
                    <input
                      type="text"
                      value={mtnNum}
                      onChange={(e) => setMtnNum(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Numéro Officiel Moov Money
                    </label>
                    <input
                      type="text"
                      value={moovNum}
                      onChange={(e) => setMoovNum(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Numéro Support WhatsApp
                    </label>
                    <input
                      type="text"
                      value={supportNum}
                      onChange={(e) => setSupportNum(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2.5 rounded-xl text-xs transition-colors shadow-xs"
                >
                  Enregistrer les numéros
                </button>
              </form>

              {/* Reset to defaults */}
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2">
                <h5 className="font-black text-rose-900">Réinitialisation des Données</h5>
                <p className="text-[11px] text-rose-700">
                  Effacer tout le stockage local et rétablir les données d'usine conformes au cahier des charges.
                </p>
                <button
                  onClick={resetToDefaults}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-2 px-4 rounded-xl text-xs transition-colors shadow-xs"
                >
                  Réinitialiser l'application
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
