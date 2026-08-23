import React from 'react';
import { Target, PlusCircle, Settings, Calendar, BarChart3, Filter, History, Award, Clock } from 'lucide-react';
import { ChallengeMetrics, ChallengeSettings } from '../types';
import { CloudSyncIndicator } from './CloudSyncIndicator';
import { User } from 'firebase/auth';

interface NavbarProps {
  metrics: ChallengeMetrics;
  settings: ChallengeSettings;
  activeTab: 'dashboard' | 'heatmap' | 'funnel' | 'weekly' | 'history';
  setActiveTab: (tab: 'dashboard' | 'heatmap' | 'funnel' | 'weekly' | 'history') => void;
  onLogToday: () => void;
  onOpenSettings: () => void;
  hasTodayEntry: boolean;
  currentUser: User | null;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  syncError: string | null;
  onManualSync: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  metrics,
  settings,
  activeTab,
  setActiveTab,
  onLogToday,
  onOpenSettings,
  hasTodayEntry,
  currentUser,
  isSyncing,
  lastSyncedAt,
  syncError,
  onManualSync
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0F0F12]/90 backdrop-blur-md border-b border-white/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Challenge Title */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
              <Target className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-100 leading-tight tracking-tight">
                  100-Day Client Acquisition
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Challenge
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Daily Outreach & Conversion Accountability Tracker
              </p>
            </div>
          </div>

          {/* Day Status Pill */}
          <div className="hidden lg:flex items-center bg-[#16161A] rounded-full px-3.5 py-1.5 border border-white/10 shadow-inner">
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                metrics.isComplete ? 'bg-emerald-400 animate-pulse' :
                metrics.isNotStarted ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
              }`} />
              <span className="text-xs font-bold text-slate-200">
                {metrics.isNotStarted ? `Starts in ${metrics.daysUntilStart} Days` :
                 metrics.isComplete ? 'Challenge Complete! 🎉' :
                 `Day ${metrics.currentDayNumber} of 100`}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-xs font-medium text-slate-400">
                {metrics.isComplete ? '100% Done' : `${metrics.daysRemaining} days remaining`}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Cloud Sync Status Indicator */}
            <CloudSyncIndicator
              user={currentUser}
              isSyncing={isSyncing}
              lastSyncedAt={lastSyncedAt}
              syncError={syncError}
              onManualSync={onManualSync}
            />

            <button
              id="nav-log-today-btn"
              onClick={onLogToday}
              className={`inline-flex items-center justify-center px-3.5 py-2 rounded-xl text-sm font-bold shadow-xs transition-all cursor-pointer ${
                hasTodayEntry
                  ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 active:scale-98'
              }`}
            >
              <PlusCircle className="h-4 w-4 mr-1.5 stroke-[2.5]" />
              <span>{hasTodayEntry ? 'Edit Today' : 'Log Today'}</span>
            </button>

            <button
              id="nav-settings-btn"
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
              title="Challenge Settings & Data"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 sm:space-x-2 border-t border-white/5 overflow-x-auto py-2 scrollbar-none">
          <button
            id="tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <BarChart3 className="h-4 w-4 mr-1.5" />
            Dashboard
          </button>

          <button
            id="tab-heatmap"
            onClick={() => setActiveTab('heatmap')}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'heatmap'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Calendar className="h-4 w-4 mr-1.5" />
            100-Day Heatmap
          </button>

          <button
            id="tab-funnel"
            onClick={() => setActiveTab('funnel')}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'funnel'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Filter className="h-4 w-4 mr-1.5" />
            Funnel & Channels
          </button>

          <button
            id="tab-weekly"
            onClick={() => setActiveTab('weekly')}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'weekly'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Clock className="h-4 w-4 mr-1.5" />
            Weekly Breakdown
          </button>

          <button
            id="tab-history"
            onClick={() => setActiveTab('history')}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <History className="h-4 w-4 mr-1.5" />
            Entries History
          </button>
        </div>

      </div>
    </header>
  );
};
