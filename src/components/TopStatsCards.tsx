import React from 'react';
import { 
  Send, 
  MessageSquare, 
  Users, 
  DollarSign, 
  Flame, 
  TrendingUp, 
  Sparkles,
  CheckCircle2,
  CalendarDays,
  Target
} from 'lucide-react';
import { ChallengeMetrics, ChallengeSettings } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';

interface TopStatsCardsProps {
  metrics: ChallengeMetrics;
  settings: ChallengeSettings;
}

export const TopStatsCards: React.FC<TopStatsCardsProps> = ({ metrics, settings }) => {
  const getPaceBadge = (status: 'ahead' | 'on_track' | 'behind') => {
    switch (status) {
      case 'ahead':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Ahead of Pace</span>;
      case 'on_track':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">On Track</span>;
      case 'behind':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">Behind Pace</span>;
    }
  };

  return (
    <section aria-label="Core Metrics" className="space-y-4">
      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Pitches */}
        <div id="stat-card-pitches" className="bg-[#121216] rounded-2xl p-5 border border-white/10 shadow-xs hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Pitches Sent
            </span>
            <div className="p-2 rounded-xl bg-white/5 text-emerald-400 border border-white/5">
              <Send className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {metrics.totalPitches.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-400">
              Target: {settings.targetDailyPitches}/day
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-300">
            <span>Daily Active Avg: <strong className="text-white">{metrics.dailyAvgPitches.toFixed(1)}</strong></span>
            {getPaceBadge(metrics.pitchPaceStatus)}
          </div>
        </div>

        {/* Card 2: Total Responses & Response Rate */}
        <div id="stat-card-responses" className="bg-[#121216] rounded-2xl p-5 border border-white/10 shadow-xs hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Responses Received
            </span>
            <div className="p-2 rounded-xl bg-white/5 text-sky-400 border border-white/5">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {metrics.totalResponses.toLocaleString()}
            </span>
            <div className="text-right">
              <span className="text-sm font-bold text-sky-400">
                {formatPercent(metrics.responseRate)}
              </span>
              <span className="text-[11px] block text-slate-500">Response Rate</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-300">
            <span>Positive/Warm: <strong className="text-white">{metrics.totalPositiveResponses}</strong></span>
            <span className="text-xs text-slate-400">
              ({formatPercent(metrics.positiveResponseRate)} of replies)
            </span>
          </div>
        </div>

        {/* Card 3: Meetings & Proposals */}
        <div id="stat-card-meetings" className="bg-[#121216] rounded-2xl p-5 border border-white/10 shadow-xs hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Calls & Meetings
            </span>
            <div className="p-2 rounded-xl bg-white/5 text-teal-400 border border-white/5">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {metrics.totalMeetings.toLocaleString()}
            </span>
            <div className="text-right">
              <span className="text-sm font-bold text-teal-400">
                {formatPercent(metrics.meetingRate)}
              </span>
              <span className="text-[11px] block text-slate-500">Conv. from reply</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-300">
            <span>Proposals Sent: <strong className="text-white">{metrics.totalProposals}</strong></span>
            <span className="text-xs text-slate-400">
              Close rate: <strong className="text-slate-200">{formatPercent(metrics.closeRate)}</strong>
            </span>
          </div>
        </div>

        {/* Card 4: Clients Closed & Revenue */}
        <div id="stat-card-revenue" className="bg-[#121216] rounded-2xl p-5 border border-white/10 shadow-xs hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Clients & Revenue
            </span>
            <div className="p-2 rounded-xl bg-white/5 text-emerald-400 border border-white/5">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
              {formatCurrency(metrics.totalRevenue, settings.currencySymbol)}
            </span>
            <div className="text-right">
              <span className="text-sm font-bold text-white">
                {metrics.totalClients} / {settings.targetClients}
              </span>
              <span className="text-[11px] block text-slate-500">Clients Won</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-300">
            <span>Avg Deal: <strong className="text-white">{formatCurrency(metrics.avgRevenuePerClient, settings.currencySymbol)}</strong></span>
            {getPaceBadge(metrics.revenuePaceStatus)}
          </div>
        </div>

      </div>

      {/* Secondary Efficiency & Habit Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
        
        {/* Efficiency Metric */}
        <div className="bg-[#121216] rounded-xl p-3.5 border border-white/10 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
              Pitches per Client
            </span>
            <span className="text-base font-bold text-white">
              {metrics.totalClients > 0 ? `~${Math.round(metrics.avgPitchesPerClient)} pitches` : 'N/A yet'}
            </span>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-[#121216] rounded-xl p-3.5 border border-white/10 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
              Active Streak
            </span>
            <span className="text-base font-bold text-white">
              {metrics.currentStreak} {metrics.currentStreak === 1 ? 'day' : 'days'}
              <span className="text-xs font-normal text-slate-400 ml-1.5">(Best: {metrics.bestStreak}d)</span>
            </span>
          </div>
        </div>

        {/* Days Breakdown */}
        <div className="bg-[#121216] rounded-xl p-3.5 border border-white/10 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
              Day Status Breakdown
            </span>
            <span className="text-xs font-bold text-white">
              <span className="text-emerald-400">{metrics.activeDaysCount} Active</span> •{' '}
              <span className="text-purple-400">{metrics.restDaysCount} Rest</span> •{' '}
              <span className="text-amber-400">{metrics.missedDaysCount} Missed</span>
            </span>
          </div>
        </div>

        {/* Projected Outcome */}
        <div className="bg-[#121216] rounded-xl p-3.5 border border-white/10 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
              Projected Revenue (Day 100)
            </span>
            <span className="text-base font-bold text-emerald-400">
              {formatCurrency(metrics.projectedRevenue, settings.currencySymbol)}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
