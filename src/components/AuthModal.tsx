import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Lock, 
  Phone, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, showToast } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [phone, setPhone] = useState('+225 ');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register') {
      if (!firstName.trim() || !lastName.trim()) {
        showToast('Veuillez renseigner votre nom et prénom', 'error');
        return;
      }
      if (password.length < 6) {
        showToast('Le mot de passe doit comporter au moins 6 caractères', 'error');
        return;
      }
      if (password !== confirmPassword) {
        showToast('Les mots de passe ne correspondent pas', 'error');
        return;
      }
      setLoading(true);
      const res = await register(firstName, lastName, phone, password);
      setLoading(false);
      if (res.success) {
        setIsAuthModalOpen(false);
      }
    } else {
      setLoading(true);
      const res = await login(phone, password);
      setLoading(false);
      if (res.success) {
        setIsAuthModalOpen(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
              CI
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                {mode === 'login' ? 'Connexion Sécurisée' : 'Créer un Compte'}
              </h3>
              <p className="text-[10px] text-slate-500">Plateforme InvestCI</p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-2 text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 rounded-lg transition-all ${
              mode === 'login' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Se Connecter
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2 rounded-lg transition-all ${
              mode === 'register' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            S'inscrire
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-[11px]">Nom</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Koffi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-[11px]">Prénom</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Kadjo"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden font-medium"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-bold text-slate-700 block text-[11px]">Numéro de téléphone</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+225 05 00 00 00 00"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 block text-[11px]">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden font-medium"
            />
          </div>

          {mode === 'register' && (
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block text-[11px]">Confirmer le mot de passe</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden font-medium"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl text-xs shadow-md transition-all active:scale-98 flex items-center justify-center space-x-1.5 mt-2"
          >
            <span>{mode === 'login' ? 'Se Connecter' : 'Créer mon Compte'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
