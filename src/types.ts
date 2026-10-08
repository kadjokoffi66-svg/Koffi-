export type PaymentMethodType = 'Wave' | 'Moov Money' | 'Orange Money' | 'MTN Money';

export interface InvestmentPlan {
  id: string;
  name: string; // e.g. "FIX 1 — 90 JOURS", "ACTIVITÉ 01"
  category: 'fix' | 'activity';
  durationDays: number;
  minAmount: number; // 2000 FCFA
  maxAmount: number; // e.g. 1 000 000 FCFA
  availableAmounts: number[]; // [2000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000]
  totalReturnRatePercent: number; // e.g. 180% (return bonus)
  dailyRatePercent: number;
  description: string;
  badge?: string;
  color: string;
  iconName: string;
  popular?: boolean;
  isActive: boolean;
  risksDisclaimer: string;
}

export interface UserInvestment {
  id: string; // INV-XXXXX
  planId: string;
  planName: string;
  investedAmount: number;
  expectedTotalReturn: number;
  returnRatePercent: number;
  dailyEarnings: number;
  startDate: string; // ISO string
  endDate: string; // ISO string
  durationDays: number;
  currentDayProgress: number; // in days
  status: 'active' | 'completed'; // 'active' = 🟢 EN CIRCULATION, 'completed' = TERMINÉ
  category: 'fix' | 'activity';
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'return' | 'referral_bonus' | 'daily_bonus';
  amount: number;
  fee?: number; // 6% on withdrawal
  netAmount?: number;
  method?: PaymentMethodType;
  phoneNumber?: string;
  accountName?: string;
  referenceId?: string;
  status: 'completed' | 'pending' | 'rejected' | 'approved' | 'paid' | 'cancelled' | 'confirmed';
  createdAt: string;
  description: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'deposit' | 'investment' | 'completion' | 'withdrawal' | 'security' | 'info';
  read: boolean;
  createdAt: string;
}

export interface ReferralMember {
  id: string;
  name: string;
  phoneMasked: string;
  level: 1 | 2 | 3;
  joinedAt: string;
  totalInvested: number;
  commissionEarned: number;
  status: 'active' | 'inactive';
}

export interface UserProfile {
  id: string;
  memberId?: string;
  maskedPhone?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  password?: string;
  email?: string;
  role: 'user' | 'admin';
  isSuspended?: boolean;
  vipLevel: number;
  vipProgress?: number;
  vipMaxProgress?: number;
  luckySpinsCount?: number;
  referralCode: string;
  referredBy?: string;
  pinCode: string;
  balance: number; // Solde Disponible (immédiatement utilisable/retirable)
  rechargeBalance: number; // Solde de Recharge
  totalInvested: number; // Total des investissements actifs
  totalWithdrawn: number; // Total retiré cumulé
  todayEarnings: number;
  totalEarnings: number;
  totalCommission: number;
  avatarUrl?: string;
  joinedDate: string;
  lastDailyBonusDate?: string;
}

export interface PlatformConfig {
  officialWaveNumber: string;
  officialMoovNumber: string;
  officialMtnNumber: string;
  waveMerchantPaymentUrl: string;
  merchantName: string;
  whatsappSupportNumber: string;
  minDeposit: number;
  minWithdrawal: number;
  withdrawalFeePercent: number; // 6%
  availablePlanAmounts: number[];
  referralRates: {
    level1: number;
    level2: number;
    level3: number;
  };
}
