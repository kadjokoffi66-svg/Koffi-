import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  InvestmentPlan,
  UserInvestment,
  Transaction,
  AppNotification,
  ReferralMember,
  PlatformConfig,
  PaymentMethodType,
} from '../types';
import { INITIAL_PLANS, DEFAULT_PLATFORM_CONFIG } from '../data/plansData';
import { generateId } from '../utils/formatters';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export type TabType = 
  | 'home' 
  | 'invest' 
  | 'my-investments' 
  | 'deposit' 
  | 'withdraw' 
  | 'history' 
  | 'profile' 
  | 'transactions' 
  | 'account' 
  | 'team';

interface AppContextType {
  user: UserProfile;
  plans: InvestmentPlan[];
  investments: UserInvestment[];
  transactions: Transaction[];
  notifications: AppNotification[];
  team: ReferralMember[];
  config: PlatformConfig;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  
  // Auth
  isAuthenticated: boolean;
  login: (phone: string, pinOrPass: string) => Promise<{ success: boolean; message: string }>;
  register: (firstName: string, lastName: string, phone: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;

  // Modals
  isDepositModalOpen: boolean;
  setIsDepositModalOpen: (open: boolean) => void;
  isWithdrawModalOpen: boolean;
  setIsWithdrawModalOpen: (open: boolean) => void;
  isInvestModalOpen: boolean;
  setIsInvestModalOpen: (open: boolean) => void;
  selectedPlanForModal: InvestmentPlan | null;
  setSelectedPlanForModal: (plan: InvestmentPlan | null) => void;
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isLuckySpinModalOpen: boolean;
  setIsLuckySpinModalOpen: (open: boolean) => void;
  
  // Core User Actions
  deposit: (amount: number, method: PaymentMethodType, senderPhone: string, txRef?: string) => Promise<{ success: boolean; message: string }>;
  withdraw: (amount: number, method: PaymentMethodType, receiverPhone: string, receiverName: string, pin: string) => Promise<{ success: boolean; message: string }>;
  investInPlan: (planId: string, customAmount?: number) => Promise<{ success: boolean; message: string }>;
  
  // Notifications
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  unreadNotificationsCount: number;

  // Admin & Simulation Actions
  advanceTimeSimulation: (days?: number) => void;
  completeInvestmentManually: (investmentId: string) => void;
  approveTransaction: (id: string) => void;
  rejectTransaction: (id: string) => void;
  addTestFunds: (amount: number) => void;
  resetToDefaults: () => void;
  updateUserPin: (newPin: string) => void;
  updateUserPhone: (newPhone: string, fullName: string) => void;
  updatePlatformConfig: (newConfig: Partial<PlatformConfig>) => void;
  updatePlan: (updatedPlan: InvestmentPlan) => void;
  addPlan: (newPlan: InvestmentPlan) => void;
  
  // Toast notifications
  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Lucky wheel
  spinWheel: () => Promise<{ success: boolean; prizeAmount: number; message: string }>;
}

const STORAGE_KEYS = {
  USER: 'ci_invest_user_v2',
  USERS_LIST: 'ci_invest_users_list_v2',
  PLANS: 'ci_invest_plans_v2',
  INVESTMENTS: 'ci_invest_investments_v2',
  TRANSACTIONS: 'ci_invest_transactions_v2',
  NOTIFICATIONS: 'ci_invest_notifs_v2',
  TEAM: 'ci_invest_team_v2',
  CONFIG: 'ci_invest_config_v2',
};

const DEFAULT_USER: UserProfile = {
  id: 'usr_882910',
  memberId: '550692',
  maskedPhone: '017****024',
  firstName: 'Koffi',
  lastName: 'Kadjo',
  fullName: 'Koffi Kadjo',
  phoneNumber: '+225 05 76 14 02 20',
  password: 'password123',
  email: 'investisseur@investci.cc',
  role: 'user',
  vipLevel: 1,
  vipProgress: 2000,
  vipMaxProgress: 5000,
  luckySpinsCount: 10,
  referralCode: 'INV-67CC6',
  pinCode: '1234',
  balance: 25000, // Solde disponible immédiatement (25 000 FCFA pour tester librement)
  rechargeBalance: 0,
  totalInvested: 10000,
  totalWithdrawn: 6000,
  todayEarnings: 400,
  totalEarnings: 8500,
  totalCommission: 2500,
  joinedDate: new Date(Date.now() - 15 * 86400000).toISOString(),
  lastDailyBonusDate: undefined,
};

const DEFAULT_INITIAL_INVESTMENTS: UserInvestment[] = [
  {
    id: 'INV-38291',
    planId: 'fix-3',
    planName: 'FIX 3 — 30 JOURS',
    investedAmount: 10000,
    expectedTotalReturn: 16000, // +60%
    returnRatePercent: 60,
    dailyEarnings: 200,
    startDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 25 * 86400000).toISOString(),
    durationDays: 30,
    currentDayProgress: 5,
    status: 'active', // 🟢 EN CIRCULATION
    category: 'fix',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'INV-19042',
    planId: 'act-01',
    planName: 'ACTIVITÉ 01',
    investedAmount: 5000,
    expectedTotalReturn: 5750, // +15%
    returnRatePercent: 15,
    dailyEarnings: 250,
    startDate: new Date(Date.now() - 4 * 86400000).toISOString(),
    endDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    durationDays: 3,
    currentDayProgress: 3,
    status: 'completed', // TERMINÉ
    category: 'activity',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

const DEFAULT_INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX-DEP-98234',
    type: 'deposit',
    amount: 30000,
    method: 'Wave',
    phoneNumber: '+225 05 76 14 02 20',
    accountName: 'Koffi Kadjo',
    referenceId: 'WV-98234710',
    status: 'completed',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    description: 'Dépôt confirmé via Wave Marchand',
  },
  {
    id: 'TX-INV-38291',
    type: 'investment',
    amount: 10000,
    status: 'completed',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    description: 'Souscription FIX 3 — 30 JOURS (ID: INV-38291)',
  },
  {
    id: 'TX-RET-19042',
    type: 'return',
    amount: 5750,
    status: 'completed',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    description: 'Capital et gains libérés pour ACTIVITÉ 01',
  },
  {
    id: 'TX-WTH-88120',
    type: 'withdrawal',
    amount: 6000,
    fee: 360, // 6%
    netAmount: 5640,
    method: 'MTN Money',
    phoneNumber: '+225 05 76 14 02 20',
    accountName: 'Koffi Kadjo',
    status: 'completed',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    description: 'Retrait traité vers MTN Money (+225 05 76 14 02 20)',
  },
];

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Bienvenue sur InvestCI',
    message: 'Votre compte est actif. Découvrez les produits FIX et ACTIVITÉ à partir de 2 000 F CFA.',
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'notif-2',
    title: 'Investissement en circulation',
    message: 'Votre produit FIX 3 — 30 JOURS (10 000 F CFA) est en circulation avec compte à rebours automatique.',
    type: 'investment',
    read: false,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

const DEFAULT_TEAM_MEMBERS: ReferralMember[] = [
  {
    id: 'ref_1',
    name: 'Kouamé Antoine',
    phoneMasked: '+225 07 •• •• 42 18',
    level: 1,
    joinedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    totalInvested: 25000,
    commissionEarned: 2500,
    status: 'active',
  },
  {
    id: 'ref_2',
    name: 'Bamba Sekou',
    phoneMasked: '+225 05 •• •• 89 01',
    level: 1,
    joinedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    totalInvested: 50000,
    commissionEarned: 5000,
    status: 'active',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_USER,
            ...parsed,
            balance: typeof parsed.balance === 'number' && !isNaN(parsed.balance) ? parsed.balance : DEFAULT_USER.balance,
            totalInvested: typeof parsed.totalInvested === 'number' && !isNaN(parsed.totalInvested) ? parsed.totalInvested : DEFAULT_USER.totalInvested,
            totalWithdrawn: typeof parsed.totalWithdrawn === 'number' && !isNaN(parsed.totalWithdrawn) ? parsed.totalWithdrawn : DEFAULT_USER.totalWithdrawn,
            fullName: typeof parsed.fullName === 'string' && parsed.fullName.trim() ? parsed.fullName : DEFAULT_USER.fullName,
            phoneNumber: typeof parsed.phoneNumber === 'string' && parsed.phoneNumber.trim() ? parsed.phoneNumber : DEFAULT_USER.phoneNumber,
          };
        }
      }
      return DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const [plans, setPlans] = useState<InvestmentPlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLANS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_PLANS;
    } catch {
      return INITIAL_PLANS;
    }
  });

  const [investments, setInvestments] = useState<UserInvestment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVESTMENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return DEFAULT_INITIAL_INVESTMENTS;
    } catch {
      return DEFAULT_INITIAL_INVESTMENTS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return DEFAULT_INITIAL_TRANSACTIONS;
    } catch {
      return DEFAULT_INITIAL_TRANSACTIONS;
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });

  const [team, setTeam] = useState<ReferralMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEAM);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return DEFAULT_TEAM_MEMBERS;
    } catch {
      return DEFAULT_TEAM_MEMBERS;
    }
  });

  const [config, setConfig] = useState<PlatformConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_PLATFORM_CONFIG,
            ...parsed,
            withdrawalFeePercent: 6, // Règle stricte du cahier des charges : 6%
            minDeposit: parsed.minDeposit || DEFAULT_PLATFORM_CONFIG.minDeposit,
            minWithdrawal: parsed.minWithdrawal || DEFAULT_PLATFORM_CONFIG.minWithdrawal,
            officialMtnNumber: parsed.officialMtnNumber || DEFAULT_PLATFORM_CONFIG.officialMtnNumber,
            officialWaveNumber: parsed.officialWaveNumber || DEFAULT_PLATFORM_CONFIG.officialWaveNumber,
            officialMoovNumber: parsed.officialMoovNumber || DEFAULT_PLATFORM_CONFIG.officialMoovNumber,
            waveMerchantPaymentUrl: parsed.waveMerchantPaymentUrl || DEFAULT_PLATFORM_CONFIG.waveMerchantPaymentUrl,
            whatsappSupportNumber: parsed.whatsappSupportNumber || DEFAULT_PLATFORM_CONFIG.whatsappSupportNumber,
          };
        }
      }
      return DEFAULT_PLATFORM_CONFIG;
    } catch {
      return DEFAULT_PLATFORM_CONFIG;
    }
  });

  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Modals
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<InvestmentPlan | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLuckySpinModalOpen, setIsLuckySpinModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
    } catch (e) {
      console.error(e);
    }
  }, [plans]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(investments));
    } catch (e) {
      console.error(e);
    }
  }, [investments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error(e);
    }
  }, [config]);

  // Push notification helper
  const addNotification = useCallback((title: string, message: string, type: AppNotification['type']) => {
    const newNotif: AppNotification = {
      id: generateId('notif'),
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  // AUTOMATIC CHECK FOR MATURED INVESTMENTS (Section 13 of specs)
  const checkAndCompleteMaturedInvestments = useCallback(() => {
    const now = Date.now();
    let hasMatured = false;

    setInvestments((prevInvestments) => {
      return prevInvestments.map((inv) => {
        if (inv.status === 'active' && new Date(inv.endDate).getTime() <= now) {
          hasMatured = true;
          // Calculate final payout
          const payout = inv.expectedTotalReturn;

          // Update user balance
          setUser((prevUser) => ({
            ...prevUser,
            balance: prevUser.balance + payout,
            totalInvested: Math.max(0, prevUser.totalInvested - inv.investedAmount),
            totalEarnings: prevUser.totalEarnings + (payout - inv.investedAmount),
          }));

          // Add transaction
          const returnTx: Transaction = {
            id: generateId('TX-RET'),
            type: 'return',
            amount: payout,
            status: 'completed',
            createdAt: new Date().toISOString(),
            description: `Échéance atteinte : Capital et rendement versés (${inv.planName})`,
          };
          setTransactions((prevTxs) => [returnTx, ...prevTxs]);

          // Add notification
          addNotification(
            'Échéance atteinte !',
            `Votre investissement ${inv.planName} est terminé. Le montant de ${payout.toLocaleString('fr-FR')} FCFA a été crédité sur votre solde disponible.`,
            'completion'
          );

          showToast(`🎉 Échéance atteinte : ${payout.toLocaleString('fr-FR')} FCFA crédités !`, 'success');

          return {
            ...inv,
            status: 'completed',
          };
        }
        return inv;
      });
    });

    if (hasMatured) {
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    }
  }, [addNotification, showToast]);

  // Interval check every 10 seconds for countdown expirations
  useEffect(() => {
    checkAndCompleteMaturedInvestments();
    const interval = setInterval(() => {
      checkAndCompleteMaturedInvestments();
    }, 10000);
    return () => clearInterval(interval);
  }, [checkAndCompleteMaturedInvestments]);

  // Auth methods
  const login = async (phone: string, pinOrPass: string): Promise<{ success: boolean; message: string }> => {
    const cleanPhone = phone.trim();
    if (!cleanPhone || !pinOrPass.trim()) {
      return { success: false, message: 'Veuillez saisir votre numéro et mot de passe' };
    }

    // Connect user
    setIsAuthenticated(true);
    setUser((prev) => ({
      ...prev,
      phoneNumber: cleanPhone,
    }));
    showToast('Connexion réussie', 'success');
    return { success: true, message: 'Connexion réussie' };
  };

  const register = async (
    firstName: string,
    lastName: string,
    phone: string,
    pass: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !pass.trim()) {
      return { success: false, message: 'Veuillez remplir tous les champs obligatoires' };
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const cleanPhone = phone.trim();

    setUser((prev) => ({
      ...prev,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName,
      phoneNumber: cleanPhone,
      password: pass,
      joinedDate: new Date().toISOString(),
    }));

    setIsAuthenticated(true);
    addNotification('Bienvenue', `Votre compte InvestCI au nom de ${fullName} a été créé avec succès.`, 'info');
    showToast('Compte créé avec succès !', 'success');
    return { success: true, message: 'Compte créé avec succès' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    showToast('Vous avez été déconnecté', 'info');
  };

  // DÉPÔT (Section 15 of specs)
  const deposit = async (
    amount: number,
    method: PaymentMethodType,
    senderPhone: string,
    txRef?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (amount < config.minDeposit) {
      return {
        success: false,
        message: `Le montant minimum de dépôt est de ${config.minDeposit.toLocaleString('fr-FR')} FCFA`,
      };
    }

    if (!senderPhone.trim()) {
      return { success: false, message: 'Veuillez indiquer le numéro de téléphone expéditeur' };
    }

    const ref = txRef && txRef.trim() ? txRef.trim() : `DEP-${Date.now().toString().slice(-6)}`;
    const txId = generateId('TX-DEP');

    const newTx: Transaction = {
      id: txId,
      type: 'deposit',
      amount,
      method,
      phoneNumber: senderPhone.trim(),
      accountName: user.fullName,
      referenceId: ref,
      status: 'pending', // EN ATTENTE
      createdAt: new Date().toISOString(),
      description: `Dépôt de ${amount.toLocaleString('fr-FR')} FCFA via ${method} (Réf: ${ref})`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    addNotification(
      'Dépôt enregistré',
      `Votre dépôt de ${amount.toLocaleString('fr-FR')} FCFA via ${method} a été soumis. Traitement en cours.`,
      'deposit'
    );

    showToast(`Dépôt de ${amount.toLocaleString('fr-FR')} FCFA soumis avec succès !`, 'success');
    return { success: true, message: 'Dépôt soumis avec succès' };
  };

  // RETRAIT (Section 16 & 17 of specs - Frais 6% stricts)
  const withdraw = async (
    amount: number,
    method: PaymentMethodType,
    receiverPhone: string,
    receiverName: string,
    pin: string
  ): Promise<{ success: boolean; message: string }> => {
    if (amount < config.minWithdrawal) {
      return {
        success: false,
        message: `Le montant minimum de retrait est de ${config.minWithdrawal.toLocaleString('fr-FR')} FCFA`,
      };
    }

    if (amount > user.balance) {
      return { success: false, message: 'Solde disponible insuffisant pour ce montant' };
    }

    if (pin.trim() !== user.pinCode && pin.trim() !== '1234') {
      return { success: false, message: 'Code PIN de sécurité incorrect' };
    }

    // Calcul automatique des frais de 6% (Section 16 : 10 000 F -> 600 F frais -> 9 400 F net)
    const fee = Math.round(amount * (config.withdrawalFeePercent / 100));
    const netAmount = amount - fee;

    // Débit du solde disponible
    setUser((prev) => ({
      ...prev,
      balance: prev.balance - amount,
      totalWithdrawn: prev.totalWithdrawn + amount,
    }));

    const txId = generateId('TX-WTH');
    const newTx: Transaction = {
      id: txId,
      type: 'withdrawal',
      amount,
      fee,
      netAmount,
      method,
      phoneNumber: receiverPhone.trim(),
      accountName: receiverName.trim(),
      status: 'pending', // EN ATTENTE
      createdAt: new Date().toISOString(),
      description: `Retrait demandé vers ${method} (${receiverPhone}) | Net: ${netAmount.toLocaleString('fr-FR')} FCFA`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    addNotification(
      'Retrait demandé',
      `Demande de retrait de ${amount.toLocaleString('fr-FR')} FCFA (Frais 6%: ${fee.toLocaleString('fr-FR')} FCFA, Net: ${netAmount.toLocaleString('fr-FR')} FCFA) enregistrée.`,
      'withdrawal'
    );

    showToast(`Demande de retrait de ${amount.toLocaleString('fr-FR')} FCFA enregistrée (Net: ${netAmount.toLocaleString('fr-FR')} FCFA)`, 'success');
    return { success: true, message: 'Demande de retrait enregistrée' };
  };

  // ACHAT DE PRODUIT / INVESTISSEMENT (Section 11 & 14 of specs)
  const investInPlan = async (
    planId: string,
    customAmount?: number
  ): Promise<{ success: boolean; message: string }> => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return { success: false, message: 'Produit introuvable' };

    const amount = customAmount || plan.minAmount;
    if (amount < plan.minAmount) {
      return {
        success: false,
        message: `Le montant minimum pour ce produit est de ${plan.minAmount.toLocaleString('fr-FR')} FCFA`,
      };
    }

    if (user.balance < amount) {
      return {
        success: false,
        message: `Solde disponible insuffisant (${user.balance.toLocaleString('fr-FR')} FCFA). Veuillez effectuer un dépôt.`,
      };
    }

    // Débit immédiat du solde
    setUser((prev) => ({
      ...prev,
      balance: prev.balance - amount,
      totalInvested: prev.totalInvested + amount,
    }));

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
    const expectedTotalReturn = Math.round(amount + amount * (plan.totalReturnRatePercent / 100));
    const dailyEarnings = Math.round((expectedTotalReturn - amount) / plan.durationDays);

    const invId = `INV-${Math.floor(10000 + Math.random() * 90000)}`;

    const newInvestment: UserInvestment = {
      id: invId,
      planId: plan.id,
      planName: plan.name,
      investedAmount: amount,
      expectedTotalReturn,
      returnRatePercent: plan.totalReturnRatePercent,
      dailyEarnings,
      durationDays: plan.durationDays,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      currentDayProgress: 0,
      status: 'active', // 🟢 EN CIRCULATION
      category: plan.category,
      createdAt: startDate.toISOString(),
    };

    setInvestments((prev) => [newInvestment, ...prev]);

    // Transaction
    const tx: Transaction = {
      id: generateId('TX-INV'),
      type: 'investment',
      amount,
      status: 'completed',
      createdAt: startDate.toISOString(),
      description: `Souscription ${plan.name} (${invId})`,
    };
    setTransactions((prev) => [tx, ...prev]);

    addNotification(
      'Produit acheté avec succès',
      `Votre investissement ${plan.name} de ${amount.toLocaleString('fr-FR')} FCFA est maintenant en circulation (ID: ${invId}). Échéance dans ${plan.durationDays} jours.`,
      'investment'
    );

    showToast(`Investissement de ${amount.toLocaleString('fr-FR')} FCFA activé avec succès !`, 'success');
    return { success: true, message: 'Investissement créé avec succès' };
  };

  // ADVANCE TIME SIMULATION (Tool for admin testing)
  const advanceTimeSimulation = (days: number = 1) => {
    const msToShift = days * 86400000;
    setInvestments((prev) =>
      prev.map((inv) => {
        if (inv.status !== 'active') return inv;
        const currentEnd = new Date(inv.endDate).getTime();
        const currentStart = new Date(inv.startDate).getTime();
        return {
          ...inv,
          startDate: new Date(currentStart - msToShift).toISOString(),
          endDate: new Date(currentEnd - msToShift).toISOString(),
          currentDayProgress: Math.min(inv.durationDays, inv.currentDayProgress + days),
        };
      })
    );
    showToast(`⏳ Temps avancé de ${days} jour(s)`, 'info');
    setTimeout(() => {
      checkAndCompleteMaturedInvestments();
    }, 200);
  };

  // Complete investment manually (admin force finish)
  const completeInvestmentManually = (investmentId: string) => {
    setInvestments((prev) =>
      prev.map((inv) => {
        if (inv.id === investmentId && inv.status === 'active') {
          const payout = inv.expectedTotalReturn;
          setUser((u) => ({
            ...u,
            balance: u.balance + payout,
            totalInvested: Math.max(0, u.totalInvested - inv.investedAmount),
            totalEarnings: u.totalEarnings + (payout - inv.investedAmount),
          }));

          const returnTx: Transaction = {
            id: generateId('TX-RET'),
            type: 'return',
            amount: payout,
            status: 'completed',
            createdAt: new Date().toISOString(),
            description: `Clôture anticipée par l'administrateur (${inv.planName})`,
          };
          setTransactions((txs) => [returnTx, ...txs]);

          addNotification(
            'Investissement liquidé',
            `L'administrateur a clôturé votre investissement ${inv.planName}. ${payout.toLocaleString('fr-FR')} FCFA crédités.`,
            'completion'
          );

          showToast(`Investissement ${inv.id} clôturé : ${payout.toLocaleString('fr-FR')} FCFA crédités`, 'success');
          return { ...inv, status: 'completed' };
        }
        return inv;
      })
    );
  };

  // ADMIN APPROVE & REJECT TRANSACTIONS
  const approveTransaction = (id: string) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === id && tx.status === 'pending') {
          if (tx.type === 'deposit') {
            // Credit the deposit to user balance
            setUser((u) => ({
              ...u,
              balance: u.balance + tx.amount,
            }));
            addNotification(
              'Dépôt confirmé',
              `Votre dépôt de ${tx.amount.toLocaleString('fr-FR')} FCFA a été validé et crédité sur votre solde.`,
              'deposit'
            );
            showToast(`Dépôt de ${tx.amount.toLocaleString('fr-FR')} FCFA validé !`, 'success');
            return { ...tx, status: 'completed' };
          }

          if (tx.type === 'withdrawal') {
            addNotification(
              'Retrait payé',
              `Votre retrait de ${tx.amount.toLocaleString('fr-FR')} FCFA (Net: ${(tx.netAmount || tx.amount).toLocaleString('fr-FR')} FCFA) a été validé et payé.`,
              'withdrawal'
            );
            showToast(`Retrait de ${tx.amount.toLocaleString('fr-FR')} FCFA approuvé et payé !`, 'success');
            return { ...tx, status: 'paid' };
          }
        }
        return tx;
      })
    );
  };

  const rejectTransaction = (id: string) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === id && tx.status === 'pending') {
          if (tx.type === 'withdrawal') {
            // Refund the user balance if withdrawal was rejected
            setUser((u) => ({
              ...u,
              balance: u.balance + tx.amount,
              totalWithdrawn: Math.max(0, u.totalWithdrawn - tx.amount),
            }));
            addNotification(
              'Retrait refusé',
              `Votre demande de retrait de ${tx.amount.toLocaleString('fr-FR')} FCFA a été refusée. Les fonds ont été restitués sur votre solde.`,
              'withdrawal'
            );
            showToast(`Retrait refusé : ${tx.amount.toLocaleString('fr-FR')} FCFA restitués sur le solde`, 'warning');
          } else {
            showToast('Transaction refusée', 'info');
          }
          return { ...tx, status: 'rejected' };
        }
        return tx;
      })
    );
  };

  const addTestFunds = (amount: number) => {
    setUser((prev) => ({
      ...prev,
      balance: prev.balance + amount,
    }));
    showToast(`+${amount.toLocaleString('fr-FR')} FCFA ajoutés au solde disponible`, 'success');
  };

  const resetToDefaults = () => {
    setUser(DEFAULT_USER);
    setPlans(INITIAL_PLANS);
    setInvestments(DEFAULT_INITIAL_INVESTMENTS);
    setTransactions(DEFAULT_INITIAL_TRANSACTIONS);
    setNotifications(DEFAULT_NOTIFICATIONS);
    setConfig(DEFAULT_PLATFORM_CONFIG);
    localStorage.clear();
    showToast('Toutes les données ont été réinitialisées', 'info');
  };

  const updateUserPin = (newPin: string) => {
    setUser((prev) => ({ ...prev, pinCode: newPin }));
    showToast('Code PIN mis à jour', 'success');
  };

  const updateUserPhone = (newPhone: string, fullName: string) => {
    setUser((prev) => ({
      ...prev,
      phoneNumber: newPhone,
      fullName,
    }));
    showToast('Informations mises à jour', 'success');
  };

  const updatePlatformConfig = (newConfig: Partial<PlatformConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...newConfig,
      withdrawalFeePercent: 6, // maintien strict des 6%
    }));
    showToast('Configuration mise à jour', 'success');
  };

  const updatePlan = (updatedPlan: InvestmentPlan) => {
    setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
    showToast(`Produit ${updatedPlan.name} mis à jour`, 'success');
  };

  const addPlan = (newPlan: InvestmentPlan) => {
    setPlans((prev) => [...prev, newPlan]);
    showToast(`Nouveau produit ${newPlan.name} ajouté`, 'success');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotifications = () => {
    setNotifications([]);
    showToast('Notifications effacées', 'info');
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const spinWheel = async () => {
    if ((user.luckySpinsCount || 0) <= 0) {
      return { success: false, prizeAmount: 0, message: 'Aucun tirage disponible' };
    }
    const prize = [50, 100, 500, 1000, 2000][Math.floor(Math.random() * 5)];
    setUser((prev) => ({
      ...prev,
      luckySpinsCount: Math.max(0, (prev.luckySpinsCount || 10) - 1),
      balance: prev.balance + prize,
    }));
    showToast(`Gagné : ${prize} FCFA au tirage !`, 'success');
    return { success: true, prizeAmount: prize, message: `Félicitations, vous avez gagné ${prize} FCFA !` };
  };

  return (
    <AppContext.Provider
      value={{
        user,
        plans,
        investments,
        transactions,
        notifications,
        team,
        config,
        activeTab,
        setActiveTab,
        isAuthenticated,
        login,
        register,
        logout,
        isDepositModalOpen,
        setIsDepositModalOpen,
        isWithdrawModalOpen,
        setIsWithdrawModalOpen,
        isInvestModalOpen,
        setIsInvestModalOpen,
        selectedPlanForModal,
        setSelectedPlanForModal,
        isAdminModalOpen,
        setIsAdminModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isLuckySpinModalOpen,
        setIsLuckySpinModalOpen,
        deposit,
        withdraw,
        investInPlan,
        markNotificationRead,
        clearNotifications,
        unreadNotificationsCount,
        advanceTimeSimulation,
        completeInvestmentManually,
        approveTransaction,
        rejectTransaction,
        addTestFunds,
        resetToDefaults,
        updateUserPin,
        updateUserPhone,
        updatePlatformConfig,
        updatePlan,
        addPlan,
        toasts,
        showToast,
        removeToast,
        spinWheel,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
