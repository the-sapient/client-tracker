import React, { useEffect } from 'react';
import { 
  Trophy, 
  Sparkles, 
  X, 
  Download, 
  CheckCircle2, 
  DollarSign, 
  Users, 
  Send, 
  Flame,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChallengeMetrics, ChallengeSettings, DailyEntry } from '../types';
import { formatCurrency, formatPercent, formatPrettyDate } from '../utils/calculations';
import { exportToJson, exportToCsv } from '../utils/storage';

interface ChallengeCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: ChallengeMetrics;
  settings: ChallengeSettings;
  entries: DailyEntry[];
}

export const ChallengeCompleteModal: React.FC<ChallengeCompleteModalProps> = ({
  isOpen,
  onClose,
  metrics,
  settings,
  entries
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#121216] rounded-3xl max-w-2xl w-full my-8 shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh] text-slate-200">
        
        {/* Celebration Banner Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-950 via-[#16161A] to-[#121216] text-white text-center relative overflow-hidden shrink-0 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="inline-flex p-4 rounded-2xl bg-white/5 border border-white/10 mb-3 text-amber-400 shadow-md">
            <Trophy className="h-10 w-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            100-Day Challenge Complete!
          </h2>
          <p className="text-sm text-emerald-300/80 mt-1 max-w-md mx-auto">
            You showed up, sent the pitches, and built consistent client acquisition momentum. Here is your final performance recap:
          </p>
        </div>

        {/* Victory Stats Recap */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          
          {/* Main Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            <div className="bg-[#16161A] p-4 rounded-2xl border border-white/10 text-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Total Pitches
              </span>
              <span className="text-2xl font-extrabold text-white mt-1 block">
                {metrics.totalPitches.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500">
                Avg {metrics.dailyAvgPitches.toFixed(1)}/active day
              </span>
            </div>

            <div className="bg-[#16161A] p-4 rounded-2xl border border-white/10 text-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Total Replies
              </span>
              <span className="text-2xl font-extrabold text-white mt-1 block">
                {metrics.totalResponses.toLocaleString()}
              </span>
              <span className="text-[11px] text-sky-400 font-bold">
                {formatPercent(metrics.responseRate)} reply rate
              </span>
            </div>

            <div className="bg-[#16161A] p-4 rounded-2xl border border-white/10 text-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Meetings Booked
              </span>
              <span className="text-2xl font-extrabold text-white mt-1 block">
                {metrics.totalMeetings.toLocaleString()}
              </span>
              <span className="text-[11px] text-teal-400 font-bold">
                {formatPercent(metrics.meetingRate)} conversion
              </span>
            </div>

            <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 text-center">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                Clients Won
              </span>
              <span className="text-2xl font-extrabold text-emerald-300 mt-1 block">
                {metrics.totalClients}
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">
                Goal: {settings.targetClients} clients
              </span>
            </div>

            <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 text-center col-span-2 sm:col-span-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                Total Revenue Generated
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-300 mt-1 block">
                {formatCurrency(metrics.totalRevenue, settings.currencySymbol)}
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">
                Avg {formatCurrency(metrics.avgRevenuePerClient, settings.currencySymbol)} per client deal
              </span>
            </div>
          </div>

          {/* Habit & Efficiency Summary */}
          <div className="bg-[#16161A] rounded-2xl p-4 border border-white/10 text-xs text-slate-300 space-y-2">
            <h4 className="font-bold text-slate-100 text-sm">Discipline & Efficiency Summary:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              <div>
                <span className="text-slate-500 block">Active Days:</span>
                <strong className="text-emerald-400">{metrics.activeDaysCount} Days</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Rest Days:</span>
                <strong className="text-purple-400">{metrics.restDaysCount} Days</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Best Streak:</span>
                <strong className="text-amber-400">{metrics.bestStreak} Consecutive Days</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Close Rate:</span>
                <strong className="text-slate-200">{formatPercent(metrics.closeRate)} (from Proposals)</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Outreach Efficiency:</span>
                <strong className="text-sky-400">~{Math.round(metrics.avgPitchesPerClient)} pitches/client</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Timeline:</span>
                <strong className="text-slate-200">{formatPrettyDate(settings.startDate)} – {formatPrettyDate(metrics.endDate)}</strong>
              </div>
            </div>
          </div>

          {/* Export / Backup options */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => exportToCsv(settings, entries)}
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Final CSV Report
            </button>
            <button
              onClick={() => exportToJson(settings, entries)}
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white transition-colors border border-white/10 cursor-pointer"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Full JSON Archive
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
