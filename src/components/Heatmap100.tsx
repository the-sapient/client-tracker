import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Coffee, 
  AlertCircle, 
  DollarSign, 
  Info, 
  Sparkles,
  Search,
  Users
} from 'lucide-react';
import { DayInfo, ChallengeSettings } from '../types';
import { formatCurrency, formatPrettyDate } from '../utils/calculations';

interface Heatmap100Props {
  days: DayInfo[];
  settings: ChallengeSettings;
  onSelectDay: (day: DayInfo) => void;
}

export const Heatmap100: React.FC<Heatmap100Props> = ({ days, settings, onSelectDay }) => {
  const [filterType, setFilterType] = useState<'all' | 'active' | 'rest' | 'missed' | 'clients'>('all');
  const [hoveredDay, setHoveredDay] = useState<DayInfo | null>(null);

  const getCellClasses = (day: DayInfo) => {
    const isHighlighted = 
      filterType === 'all' ||
      (filterType === 'active' && day.status === 'active') ||
      (filterType === 'rest' && day.status === 'rest') ||
      (filterType === 'missed' && day.status === 'missed') ||
      (filterType === 'clients' && day.entry && day.entry.clientsClosed > 0);

    const opacityClass = isHighlighted ? 'opacity-100' : 'opacity-20 scale-95';

    if (day.isToday) {
      return `ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#121216] bg-emerald-500/25 border-emerald-400 text-emerald-300 font-bold ${opacityClass}`;
    }

    if (day.status === 'rest') {
      return `bg-purple-900/30 border-purple-500/40 text-purple-300 ${opacityClass}`;
    }

    if (day.status === 'missed') {
      return `bg-amber-950/30 border-amber-500/40 text-amber-300 border-dashed ${opacityClass}`;
    }

    if (day.status === 'future') {
      return `bg-white/[0.03] border-white/5 text-slate-600 ${opacityClass}`;
    }

    // Active status based on pitch volume
    const pitches = day.entry?.pitches || 0;
    if (day.entry && day.entry.clientsClosed > 0) {
      return `bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-sm shadow-emerald-500/30 ${opacityClass}`;
    }
    if (pitches >= 20) {
      return `bg-emerald-600 text-white border-emerald-500 font-bold ${opacityClass}`;
    }
    if (pitches >= 12) {
      return `bg-emerald-700/80 text-emerald-100 border-emerald-600/60 font-semibold ${opacityClass}`;
    }
    if (pitches > 0) {
      return `bg-emerald-950/80 text-emerald-300 border-emerald-800/60 font-medium ${opacityClass}`;
    }

    return `bg-white/5 border-white/5 text-slate-400 ${opacityClass}`;
  };

  return (
    <div className="bg-[#121216] rounded-2xl p-5 sm:p-6 border border-white/10 shadow-xs space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-100">100-Day Challenge Matrix</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
              Interactive Heatmap
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any cell to view daily outreach details, log pitches, or mark rest days.
          </p>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-white/5'
            }`}
          >
            All 100 Days
          </button>
          <button
            onClick={() => setFilterType('active')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'active'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
            }`}
          >
            Active Days
          </button>
          <button
            onClick={() => setFilterType('rest')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'rest'
                ? 'bg-purple-500 text-white font-bold'
                : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20'
            }`}
          >
            Rest Days
          </button>
          <button
            onClick={() => setFilterType('missed')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'missed'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20'
            }`}
          >
            Missed Days
          </button>
          <button
            onClick={() => setFilterType('clients')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'clients'
                ? 'bg-emerald-400 text-slate-950 font-extrabold'
                : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
            }`}
          >
            ★ Closed Clients
          </button>
        </div>
      </div>

      {/* 100-Day Grid (10 columns on desktop, 5 on small screens) */}
      <div className="p-3 sm:p-4 bg-[#16161A] rounded-2xl border border-white/5">
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-2.5">
          {days.map((day) => {
            const pitches = day.entry?.pitches || 0;
            const hasClient = day.entry && day.entry.clientsClosed > 0;
            const hasMeeting = day.entry && day.entry.meetings > 0;

            return (
              <div
                key={day.dayNumber}
                id={`heatmap-day-${day.dayNumber}`}
                onClick={() => onSelectDay(day)}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all duration-150 hover:scale-105 hover:z-10 hover:shadow-lg ${getCellClasses(
                  day
                )}`}
              >
                {/* Day Number */}
                <span className="text-xs sm:text-sm font-bold">
                  {day.dayNumber}
                </span>

                {/* Sub-label / icon indicator */}
                <div className="mt-0.5 flex items-center justify-center gap-0.5 text-[9px]">
                  {day.isToday && (
                    <span className="text-[8px] uppercase tracking-tighter font-extrabold text-emerald-300">
                      TODAY
                    </span>
                  )}
                  {!day.isToday && day.status === 'rest' && (
                    <Coffee className="h-3 w-3 text-purple-400" />
                  )}
                  {!day.isToday && day.status === 'missed' && (
                    <span className="text-[8px] font-bold text-amber-400">MISSED</span>
                  )}
                  {!day.isToday && day.status === 'active' && (
                    <span className="font-semibold text-[10px]">
                      {pitches}p
                    </span>
                  )}
                </div>

                {/* Closed Client Star / Dot */}
                {hasClient && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-slate-950 shadow-xs border border-[#121216]">
                    $
                  </span>
                )}
                {!hasClient && hasMeeting && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-sky-400 border border-[#121216]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Hover / Inspector Strip */}
      <div className="min-h-[52px] bg-[#16161A] rounded-xl p-3 border border-white/5 flex items-center justify-between text-xs">
        {hoveredDay ? (
          <div className="flex flex-wrap items-center gap-3 text-slate-300 w-full">
            <span className="font-bold text-slate-100">
              Day {hoveredDay.dayNumber} ({formatPrettyDate(hoveredDay.dateStr)})
            </span>
            <span className="text-slate-600">|</span>
            {hoveredDay.entry ? (
              hoveredDay.entry.isRestDay ? (
                <span className="text-purple-400 font-semibold flex items-center gap-1">
                  <Coffee className="h-3.5 w-3.5" /> Rest Day {hoveredDay.entry.notes && `• "${hoveredDay.entry.notes.slice(0, 40)}..."`}
                </span>
              ) : (
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-semibold text-emerald-400">{hoveredDay.entry.pitches} pitches</span>
                  <span>•</span>
                  <span>{hoveredDay.entry.responses} responses ({hoveredDay.entry.positiveResponses} positive)</span>
                  <span>•</span>
                  <span>{hoveredDay.entry.meetings} meetings</span>
                  {hoveredDay.entry.clientsClosed > 0 && (
                    <>
                      <span>•</span>
                      <span className="font-bold text-emerald-400">
                        {hoveredDay.entry.clientsClosed} Closed ({formatCurrency(hoveredDay.entry.revenue, settings.currencySymbol)})
                      </span>
                    </>
                  )}
                  {hoveredDay.entry.notes && (
                    <span className="text-slate-400 italic max-w-xs truncate">
                      "{hoveredDay.entry.notes}"
                    </span>
                  )}
                </div>
              )
            ) : hoveredDay.status === 'missed' ? (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> Missed Day — No outreach logged
              </span>
            ) : hoveredDay.isToday ? (
              <span className="text-emerald-400 font-semibold">Today — Ready to be logged!</span>
            ) : (
              <span className="text-slate-500">Upcoming Future Day</span>
            )}
            <span className="ml-auto text-[11px] text-emerald-400 font-semibold">Click to view/edit</span>
          </div>
        ) : (
          <div className="flex items-center text-slate-400 text-xs gap-2">
            <Info className="h-4 w-4 text-slate-500" />
            <span>Hover over any day to see a quick summary, or click to edit/log.</span>
          </div>
        )}
      </div>

      {/* Heatmap Legend */}
      <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium mr-1">Pitch Intensity:</span>
          <span className="h-3.5 w-3.5 rounded bg-emerald-950/80 border border-emerald-800/60" title="1-11 pitches" />
          <span className="text-[11px] text-slate-400 mr-2">1-11</span>
          <span className="h-3.5 w-3.5 rounded bg-emerald-700/80 border border-emerald-600/60" title="12-19 pitches" />
          <span className="text-[11px] text-slate-400 mr-2">12-19</span>
          <span className="h-3.5 w-3.5 rounded bg-emerald-600 border border-emerald-500" title="20+ pitches" />
          <span className="text-[11px] text-slate-400">20+</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="h-3.5 w-3.5 rounded bg-purple-900/40 border border-purple-500/40 flex items-center justify-center text-[8px]">☕</span>
            <span className="text-[11px]">Rest Day</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-3.5 w-3.5 rounded bg-amber-950/40 border border-amber-500/40 border-dashed" />
            <span className="text-[11px]">Missed</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-3.5 w-3.5 rounded ring-2 ring-emerald-400 bg-emerald-500/20" />
            <span className="text-[11px]">Today</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-3.5 w-3.5 rounded bg-emerald-500 text-slate-950 text-[8px] flex items-center justify-center font-bold">$</span>
            <span className="text-[11px]">Closed Client</span>
          </div>
        </div>
      </div>

    </div>
  );
};
