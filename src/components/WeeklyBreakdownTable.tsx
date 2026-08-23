import React from 'react';
import { Calendar, CheckCircle2, TrendingUp, DollarSign, Clock, Users } from 'lucide-react';
import { ChallengeMetrics, ChallengeSettings, WeeklySummary } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';

interface WeeklyBreakdownTableProps {
  weeklySummaries: WeeklySummary[];
  settings: ChallengeSettings;
  metrics: ChallengeMetrics;
}

export const WeeklyBreakdownTable: React.FC<WeeklyBreakdownTableProps> = ({
  weeklySummaries,
  settings,
  metrics
}) => {
  const currentWeekNumber = Math.ceil(metrics.currentDayNumber / 7);

  return (
    <div className="bg-[#121216] rounded-2xl p-5 sm:p-6 border border-white/10 shadow-xs space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-100">14-Week Milestone Breakdown</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Weekly Progress
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Track your pitch consistency, weekly response rates, meetings booked, and revenue across all 14 challenge weeks.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-300 bg-[#16161A] px-3 py-1.5 rounded-xl border border-white/10">
          Currently in: <strong className="text-emerald-400">Week {Math.min(15, currentWeekNumber)} of 15</strong>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[11px] font-bold">
              <th className="pb-3 pr-3">Week</th>
              <th className="pb-3 px-3">Days</th>
              <th className="pb-3 px-3 text-right">Pitches</th>
              <th className="pb-3 px-3 text-right">Replies</th>
              <th className="pb-3 px-3 text-right">Resp. Rate</th>
              <th className="pb-3 px-3 text-right">Meetings</th>
              <th className="pb-3 px-3 text-right">Clients</th>
              <th className="pb-3 px-3 text-right">Revenue</th>
              <th className="pb-3 pl-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {weeklySummaries.map((w) => {
              const isCurrentWeek = w.weekNumber === currentWeekNumber && !metrics.isComplete && !metrics.isNotStarted;
              const isPastWeek = w.weekNumber < currentWeekNumber || metrics.isComplete;
              const isFutureWeek = w.weekNumber > currentWeekNumber;

              return (
                <tr 
                  key={w.weekNumber} 
                  className={`transition-colors ${
                    isCurrentWeek ? 'bg-emerald-500/10 font-medium' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  {/* Week number & badge */}
                  <td className="py-3.5 pr-3 font-bold text-slate-100 flex items-center gap-2">
                    <span>Week {w.weekNumber}</span>
                    {isCurrentWeek && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-slate-950">
                        Active
                      </span>
                    )}
                  </td>

                  {/* Day range */}
                  <td className="py-3.5 px-3 text-slate-400 text-xs">
                    Days {w.dayStartNumber}–{w.dayEndNumber}
                  </td>

                  {/* Pitches */}
                  <td className="py-3.5 px-3 text-right font-medium text-slate-200">
                    {w.pitches > 0 ? w.pitches.toLocaleString() : isFutureWeek ? '—' : 0}
                  </td>

                  {/* Replies */}
                  <td className="py-3.5 px-3 text-right font-medium text-slate-200">
                    {w.responses > 0 ? w.responses : isFutureWeek ? '—' : 0}
                  </td>

                  {/* Response rate */}
                  <td className="py-3.5 px-3 text-right font-semibold">
                    {w.pitches > 0 ? (
                      <span className={`${
                        w.responseRate >= 20 ? 'text-emerald-400 font-bold' :
                        w.responseRate >= 10 ? 'text-sky-400' : 'text-slate-400'
                      }`}>
                        {formatPercent(w.responseRate)}
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>

                  {/* Meetings */}
                  <td className="py-3.5 px-3 text-right font-medium text-slate-200">
                    {w.meetings > 0 ? w.meetings : isFutureWeek ? '—' : 0}
                  </td>

                  {/* Clients Closed */}
                  <td className="py-3.5 px-3 text-right font-bold text-white">
                    {w.clients > 0 ? (
                      <span className="text-emerald-400 font-extrabold">{w.clients}</span>
                    ) : isFutureWeek ? '—' : 0}
                  </td>

                  {/* Revenue */}
                  <td className="py-3.5 px-3 text-right font-extrabold text-emerald-400">
                    {w.revenue > 0 ? formatCurrency(w.revenue, settings.currencySymbol) : isFutureWeek ? '—' : '$0'}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 pl-3 text-center">
                    {isCurrentWeek ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        In Progress
                      </span>
                    ) : isPastWeek ? (
                      w.pitches > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/5 text-slate-300 border border-white/5">
                          Logged
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          Inactive
                        </span>
                      )
                    ) : (
                      <span className="text-slate-600 text-xs">Upcoming</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
