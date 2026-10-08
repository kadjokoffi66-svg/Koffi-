/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeTab } from './components/HomeTab';
import { InvestTab } from './components/InvestTab';
import { MyInvestmentsTab } from './components/MyInvestmentsTab';
import { TeamTab } from './components/TeamTab';
import { TransactionsTab } from './components/TransactionsTab';
import { AccountTab } from './components/AccountTab';
import { InvestModal } from './components/InvestModal';
import { RechargePageModal } from './components/RechargePageModal';
import { WithdrawModal } from './components/WithdrawModal';
import { LuckySpinModal } from './components/LuckySpinModal';
import { AdminModal } from './components/AdminModal';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';

const MainContent: React.FC<{ isMobileFrame: boolean; setIsMobileFrame: (v: boolean) => void }> = ({
  isMobileFrame,
  setIsMobileFrame,
}) => {
  const { activeTab } = useApp();

  return (
    <div className={`min-h-screen bg-slate-100 flex justify-center items-start ${isMobileFrame ? 'p-0 sm:py-6 sm:px-4' : ''}`}>
      {/* Mobile container container */}
      <main className={`w-full ${isMobileFrame ? 'max-w-md sm:rounded-[36px] sm:shadow-2xl sm:border-8 sm:border-slate-800' : 'max-w-xl'} bg-slate-50 min-h-screen sm:min-h-[840px] flex flex-col relative overflow-hidden`}>
        {/* Header */}
        <Header isMobileFrame={isMobileFrame} setIsMobileFrame={setIsMobileFrame} />

        {/* Content Area with smooth transitions */}
        <div className="flex-1 px-3.5 py-2.5 overflow-y-auto">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'invest' && <InvestTab />}
          {activeTab === 'my-investments' && <MyInvestmentsTab />}
          {activeTab === 'transactions' && <TransactionsTab />}
          {activeTab === 'account' && <AccountTab />}
        </div>

        {/* Bottom Navigation */}
        <BottomNav />

        {/* Global Modals & Popups */}
        <InvestModal />
        <RechargePageModal />
        <WithdrawModal />
        <LuckySpinModal />
        <AdminModal />
        <AuthModal />
        <Toast />
      </main>
    </div>
  );
};

export default function App() {
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  return (
    <ErrorBoundary>
      <AppProvider>
        <MainContent isMobileFrame={isMobileFrame} setIsMobileFrame={setIsMobileFrame} />
      </AppProvider>
    </ErrorBoundary>
  );
}
