import React from 'react';
import { 
  Calendar, 
  Flag, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Trophy,
  Coffee
} from 'lucide-react';
import { ChallengeMetrics, ChallengeSettings, DailyEntry } from '../types';
import { formatCurrency, formatPrettyDate, formatPercent } from '../utils/calculations';

interface ChallengeProgressBannerProps {
  metrics: ChallengeMetrics;
  settings: ChallengeSettings;
  todayEntry?: DailyEntry;
  onLogToday: () => void;
  onViewCompleteReport?: () => void;
}

export const ChallengeProgressBanner: React.FC<ChallengeProgressBannerProps> = ({
  metrics,
  settings,
  todayEntry,
  onLogToday,
  onViewCompleteReport
}) => {
  // Milestone checkpoints
  const milestones = [
    { day: 25, label: 'Quarter 1' },
    { day: 50, label: 'Halfway' },
    { day: 75, label: 'Quarter 3' },
    { day: 100, label: 'Day 100 Goal' }
  ];

  if (metrics.isNotStarted) {
    return (
      <div className="bg-gradient-to-br from-[#16161A] via-[#121216] to-[#0A0A0D] text-slate-100 rounded-2xl p-6 sm:p-8 shadow-md border border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-semibold mb-3 border border-amber-500/30">
              <Clock className="h-3.5 w-3.5" />
              <span>Upcoming Challenge</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Challenge starts on {formatPrettyDate(settings.startDate)}
            </h2>
            <p className="text-sm text-slate-400 mt-1.5 max-w-xl">
              You are {metrics.daysUntilStart} days away from Day 1. Prepare your prospect lists, email templates, and outreach channels in Settings.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-4 border border-white/10 text-center min-w-[140px]">
            <span className="text-3xl font-black text-amber-400 block">{metrics.daysUntilStart}</span>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Days to Launch</span>
          </div>
        </div>
      </div>
    );
  }

  if (metrics.isComplete) {
    return (
      <div className="bg-gradient-to-r from-emerald-950/80 via-[#121216] to-[#16161A] text-slate-100 rounded-2xl p-6 sm:p-8 shadow-md border border-emerald-500/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3 border border-emerald-500/40">
              <Trophy className="h-4 w-4" />
              <span>100-Day Challenge Completed!</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Congratulations! You completed all 100 Days.
            </h2>
            <p className="text-sm text-slate-300 mt-1.5 max-w-2xl">
              You logged <strong className="text-white">{metrics.totalPitches.toLocaleString()} pitches</strong>, converted <strong className="text-white">{metrics.totalClients} paying clients</strong>, and generated <strong className="text-emerald-400">{formatCurrency(metrics.totalRevenue, settings.currencySymbol)}</strong> in client revenue!
            </p>
          </div>
          {onViewCompleteReport && (
            <button
              onClick={onViewCompleteReport}
              className="inline-flex items-center px-5 py-3 rounded-xl font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 active:scale-98 whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              View Victory Report
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121216] rounded-2xl p-5 sm:p-6 border border-white/10 shadow-xs space-y-5">
      
      {/* Header & Days Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-slate-950 shadow-xs">
              Day {metrics.currentDayNumber} of 100
            </span>
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              Started {formatPrettyDate(settings.startDate)} • Ends {formatPrettyDate(metrics.endDate)}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-2 tracking-tight">
            {metrics.daysRemaining} Days Remaining
          </h2>
        </div>

        {/* Today's Quick Status Card */}
        <div className="flex items-center bg-[#16161A] p-3 rounded-xl border border-white/10 gap-3">
          {todayEntry ? (
            todayEntry.isRestDay ? (
              <div className="flex items-center gap-2 text-xs text-purple-400">
                <Coffee className="h-4 w-4 text-purple-400" />
                <span>Today is logged as a <strong className="text-purple-300">Rest Day</strong></span>
              </div>
            ) : (
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" /> Today Logged
                </span>
                <span className="text-slate-400 block mt-0.5">
                  {todayEntry.pitches} pitches • {todayEntry.responses} replies • {todayEntry.meetings} meetings
                </span>
              </div>
            )
          ) : (
            <div className="text-xs text-amber-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-amber-300">Today not logged yet</span>
                <span className="text-slate-400 block text-[11px]">Keep your momentum active</span>
              </div>
            </div>
          )}

          <button
            onClick={onLogToday}
            className="ml-auto inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-slate-200 hover:bg-white/15 hover:text-white border border-white/10 transition-colors shrink-0 cursor-pointer"
          >
            {todayEntry ? 'Edit' : 'Log Today'}
            <ArrowRight className="h-3 w-3 ml-1" />
          </button>
        </div>
      </div>

      {/* Progress Bar with Milestone Markers */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-400">
          <span>Day 1</span>
          <span className="text-emerald-400 font-bold">{metrics.progressPercent.toFixed(0)}% Completed</span>
          <span>Day 100</span>
        </div>

        <div className="relative w-full bg-white/5 h-3.5 rounded-full overflow-hidden p-0.5 border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 rounded-full transition-all duration-500 shadow-xs"
            style={{ width: `${Math.max(2, metrics.progressPercent)}%` }}
          />
        </div>

        {/* Milestone checkpoints below progress bar */}
        <div className="grid grid-cols-4 text-center text-[11px] pt-1 text-slate-400 border-t border-white/5">
          {milestones.map((m) => {
            const isPassed = metrics.currentDayNumber >= m.day;
            return (
              <div key={m.day} className={`flex flex-col items-center ${isPassed ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                <span>Day {m.day}</span>
                <span className="text-[10px] opacity-75">{m.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Pace Projections Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        {/* Pitch Pace */}
        <div className="bg-[#16161A] p-3 rounded-xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Pitch Target Pace</span>
            <span className="text-xs font-bold text-slate-200">
              {metrics.dailyAvgPitches.toFixed(1)} / {settings.targetDailyPitches} per active day
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
            metrics.pitchPaceStatus === 'ahead' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
            metrics.pitchPaceStatus === 'on_track' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
          }`}>
            {metrics.pitchPaceStatus === 'ahead' ? '▲ Ahead' : metrics.pitchPaceStatus === 'on_track' ? '● On Track' : '▼ Behind'}
          </span>
        </div>

        {/* Client Pace */}
        <div className="bg-[#16161A] p-3 rounded-xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Target Clients</span>
            <span className="text-xs font-bold text-slate-200">
              {metrics.totalClients} won • Proj: ~{metrics.projectedClients} (Goal: {settings.targetClients})
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
            metrics.clientPaceStatus === 'ahead' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
            metrics.clientPaceStatus === 'on_track' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
          }`}>
            {metrics.clientPaceStatus === 'ahead' ? '▲ Ahead' : metrics.clientPaceStatus === 'on_track' ? '● On Track' : '▼ Behind'}
          </span>
        </div>

        {/* Revenue Pace */}
        <div className="bg-[#16161A] p-3 rounded-xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Target Revenue</span>
            <span className="text-xs font-bold text-slate-200">
              {formatCurrency(metrics.totalRevenue, settings.currencySymbol)} • Proj: {formatCurrency(metrics.projectedRevenue, settings.currencySymbol)}
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
            metrics.revenuePaceStatus === 'ahead' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
            metrics.revenuePaceStatus === 'on_track' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
          }`}>
            {metrics.revenuePaceStatus === 'ahead' ? '▲ Ahead' : metrics.revenuePaceStatus === 'on_track' ? '● On Track' : '▼ Behind'}
          </span>
        </div>
      </div>

    </div>
  );
};
