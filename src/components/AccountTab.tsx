import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, formatDateFR } from '../utils/formatters';
import { 
  Settings, 
  MessageSquare, 
  FileText, 
  Wallet, 
  Users, 
  CreditCard,
  ChevronRight,
  Headphones,
  RotateCw,
  LogOut,
  Edit3,
  Bell,
  Lock,
  ShieldCheck,
  Check,
  Clock,
  Sparkles,
  UserCheck
} from 'lucide-react';

export const AccountTab: React.FC = () => {
  const { 
    user, 
    investments, 
    notifications,
    markNotificationRead,
    clearNotifications,
    setIsDepositModalOpen, 
    setIsWithdrawModalOpen, 
    setActiveTab,
    setIsAdminModalOpen,
    setIsAuthModalOpen,
    updateUserPin,
    updateUserPhone,
    config,
    showToast,
    logout
  } = useApp();

  const [isEditingPin, setIsEditingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const activeInvsCount = Array.isArray(investments) ? investments.filter((i) => i && i.status === 'active').length : 0;
  const completedInvsCount = Array.isArray(investments) ? investments.filter((i) => i && i.status === 'completed').length : 0;

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4) {
      showToast('Le code PIN doit comporter exactement 4 chiffres', 'error');
      return;
    }
    updateUserPin(newPin);
    setIsEditingPin(false);
    setNewPin('');
  };

  return (
    <div className="space-y-3.5 pb-20 pt-1">
      {/* Top Header: Profile card */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center p-1 shadow-md text-white font-black text-sm">
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
            <p className="text-xs font-black text-slate-700 tracking-tight font-mono">
              {user.phoneNumber}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shadow-xs transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-500 rounded-full border border-white" />
            )}
          </button>

          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shadow-xs transition-colors"
            title="Panneau Administrateur"
          >
            <Settings className="w-4 h-4 text-slate-600" />
          </button>

          <a
            href={`https://wa.me/${(config?.whatsappSupportNumber || '+2250576140220').replace(/[^0-9]/g, '')}?text=Bonjour%20service%20client`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center shadow-xs transition-colors border border-emerald-200"
            title="Discussion WhatsApp"
          >
            <MessageSquare className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Notifications Drawer if open */}
      {showNotifications && (
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-blue-600" />
              Notifications & Activités ({notifications.length})
            </h4>
            <button
              onClick={clearNotifications}
              className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
            >
              Effacer tout
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-3">Aucune notification.</p>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`p-2.5 rounded-xl border text-xs space-y-0.5 cursor-pointer transition-colors ${
                    n.read ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-blue-50 border-blue-200 text-blue-950 font-medium'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <strong className="text-[11px]">{n.title}</strong>
                    <span className="text-[9px] text-slate-400 font-mono">{formatDateFR(n.createdAt)}</span>
                  </div>
                  <p className="text-[11px] leading-tight">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Financial Overview Card */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl text-white p-4.5 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] text-blue-200 block font-medium">Solde Disponible</span>
            <p className="text-2xl font-black font-mono tracking-tight mt-0.5">
              {formatFCFA(user.balance)}
            </p>
          </div>
          <div className="bg-white/10 px-3 py-1.5 rounded-2xl text-right">
            <span className="text-[10px] text-blue-200 block">En circulation</span>
            <span className="font-mono font-bold text-emerald-300 text-xs">
              {formatFCFA(user.totalInvested)}
            </span>
          </div>
        </div>

        {/* Quick actions inside card */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/15">
          <button
            onClick={() => setIsDepositModalOpen(true)}
            className="bg-white text-blue-900 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 active:scale-98 transition-transform"
          >
            <span>👛 Déposer</span>
          </button>
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 active:scale-98 transition-transform"
          >
            <span>🏧 Retirer (6%)</span>
          </button>
        </div>
      </div>

      {/* 4 Icon Navigation Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs grid grid-cols-4 gap-2 text-center">
        {/* En circulation */}
        <button
          onClick={() => setActiveTab('my-investments')}
          className="flex flex-col items-center group"
        >
          <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-1.5 transition-transform group-active:scale-95">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-800">En cours ({activeInvsCount})</span>
        </button>

        {/* Historique */}
        <button
          onClick={() => setActiveTab('transactions')}
          className="flex flex-col items-center group"
        >
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5 transition-transform group-active:scale-95">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-800">Historique</span>
        </button>

        {/* Produits */}
        <button
          onClick={() => setActiveTab('invest')}
          className="flex flex-col items-center group"
        >
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5 transition-transform group-active:scale-95">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-800">Investir</span>
        </button>

        {/* Administration */}
        <button
          onClick={() => setIsAdminModalOpen(true)}
          className="flex flex-col items-center group"
        >
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5 transition-transform group-active:scale-95">
            <Settings className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-800">Admin</span>
        </button>
      </div>

      {/* Security & PIN Settings (Section 17 of specs) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-blue-600" />
            <h4 className="font-extrabold text-xs text-slate-900">Sécurité du Compte</h4>
          </div>
          <span className="text-[10px] text-slate-400">PIN Retrait: {user.pinCode}</span>
        </div>

        {isEditingPin ? (
          <form onSubmit={handleSavePin} className="space-y-2">
            <input
              type="password"
              maxLength={4}
              required
              placeholder="Nouveau code PIN à 4 chiffres"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-center tracking-widest font-bold"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 rounded-xl text-xs"
              >
                Valider
              </button>
              <button
                type="button"
                onClick={() => setIsEditingPin(false)}
                className="px-3 bg-slate-100 text-slate-600 font-bold py-1.5 rounded-xl text-xs"
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Code PIN de retrait (4 chiffres)</span>
            <button
              onClick={() => setIsEditingPin(true)}
              className="text-blue-600 font-bold hover:text-blue-700 text-[11px]"
            >
              Modifier le code PIN
            </button>
          </div>
        )}
      </div>

      {/* Account Switching & Auth Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold py-2.5 px-3 rounded-2xl text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Changer de compte</span>
        </button>

        <button
          onClick={logout}
          className="bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold py-2.5 px-3 rounded-2xl text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};
