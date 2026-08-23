import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { ChallengeMetrics, ChallengeSettings, DailyEntry, WeeklySummary } from '../types';
import { formatCurrency, formatPrettyDate } from '../utils/calculations';
import { TrendingUp, Send, DollarSign, BarChart2 } from 'lucide-react';

interface TrendsChartsProps {
  entries: DailyEntry[];
  settings: ChallengeSettings;
  metrics: ChallengeMetrics;
  weeklySummaries: WeeklySummary[];
}

export const TrendsCharts: React.FC<TrendsChartsProps> = ({
  entries,
  settings,
  metrics,
  weeklySummaries
}) => {
  const [activeView, setActiveView] = useState<'pitches' | 'revenue' | 'weekly'>('pitches');

  // Prepare chronological daily data
  const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  
  let runningRevenue = 0;
  let runningPitches = 0;
  const dailyChartData = sortedEntries.map((e, idx) => {
    runningRevenue += e.revenue || 0;
    runningPitches += e.pitches || 0;

    return {
      date: e.date,
      displayDate: formatPrettyDate(e.date),
      dayIndex: idx + 1,
      pitches: e.isRestDay ? 0 : (e.pitches || 0),
      responses: e.isRestDay ? 0 : (e.responses || 0),
      revenue: e.revenue || 0,
      cumulativeRevenue: runningRevenue,
      cumulativePitches: runningPitches,
      targetDaily: settings.targetDailyPitches,
      isRest: e.isRestDay
    };
  });

  // Filter weekly summaries to only weeks with activity or up to current week
  const activeWeeklyData = weeklySummaries
    .filter(w => w.pitches > 0 || w.weekNumber <= Math.ceil(metrics.currentDayNumber / 7))
    .map(w => ({
      name: `W${w.weekNumber}`,
      weekLabel: `Week ${w.weekNumber} (Days ${w.dayStartNumber}-${w.dayEndNumber})`,
      pitches: w.pitches,
      responses: w.responses,
      responseRate: Number(w.responseRate.toFixed(1)),
      revenue: w.revenue,
      clients: w.clients
    }));

  return (
    <div className="bg-[#121216] rounded-2xl p-5 sm:p-6 border border-white/10 shadow-xs space-y-5">
      
      {/* Header & Chart View Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-100">Performance & Velocity Trends</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
              Live Charts
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize pitch volume consistency, cumulative revenue trajectory, and weekly response rates.
          </p>
        </div>

        {/* View Switcher */}
        <div className="inline-flex bg-[#16161A] p-1 rounded-xl border border-white/5 text-xs font-semibold">
          <button
            onClick={() => setActiveView('pitches')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'pitches'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            <span>Daily Pitches</span>
          </button>

          <button
            onClick={() => setActiveView('revenue')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'revenue'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="h-3.5 w-3.5" />
            <span>Cumulative Revenue</span>
          </button>

          <button
            onClick={() => setActiveView('weekly')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'weekly'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>Weekly Response %</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 sm:h-80 w-full pt-4">
        {activeView === 'pitches' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pitchGradientDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(val) => {
                  const parts = val.split('-');
                  return `${parts[1]}/${parts[2]}`;
                }}
                stroke="#64748b" 
                fontSize={11} 
              />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#16161A] text-slate-100 p-3 rounded-xl shadow-2xl border border-white/10 text-xs space-y-1">
                        <p className="font-bold text-slate-200">{data.displayDate} (Day {data.dayIndex})</p>
                        {data.isRest ? (
                          <p className="text-purple-400 font-semibold">Rest Day</p>
                        ) : (
                          <>
                            <p className="text-emerald-400 font-semibold">Pitches Sent: {data.pitches}</p>
                            <p className="text-sky-400">Responses: {data.responses}</p>
                          </>
                        )}
                        <p className="text-slate-400 text-[10px]">Target: {settings.targetDailyPitches}/day</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine 
                y={settings.targetDailyPitches} 
                stroke="#f59e0b" 
                strokeDasharray="4 4" 
                label={{ value: `Target (${settings.targetDailyPitches})`, fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }} 
              />
              <Area 
                type="monotone" 
                dataKey="pitches" 
                stroke="#10b981" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#pitchGradientDark)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeView === 'revenue' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(val) => {
                  const parts = val.split('-');
                  return `${parts[1]}/${parts[2]}`;
                }}
                stroke="#64748b" 
                fontSize={11} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11}
                tickFormatter={(val) => `${settings.currencySymbol}${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#16161A] text-slate-100 p-3 rounded-xl shadow-2xl border border-white/10 text-xs space-y-1">
                        <p className="font-bold text-slate-200">{data.displayDate} (Day {data.dayIndex})</p>
                        <p className="text-emerald-400 font-extrabold">
                          Cumulative Revenue: {formatCurrency(data.cumulativeRevenue, settings.currencySymbol)}
                        </p>
                        {data.revenue > 0 && (
                          <p className="text-slate-300">New on this day: +{formatCurrency(data.revenue, settings.currencySymbol)}</p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine 
                y={settings.targetRevenue} 
                stroke="#10b981" 
                strokeDasharray="4 4" 
                label={{ value: `Goal (${formatCurrency(settings.targetRevenue, settings.currencySymbol)})`, fill: '#10b981', fontSize: 10, position: 'insideTopRight' }} 
              />
              <Line 
                type="monotone" 
                dataKey="cumulativeRevenue" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ r: 3, fill: '#10b981' }}
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeView === 'weekly' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activeWeeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis 
                stroke="#64748b" 
                fontSize={11}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#16161A] text-slate-100 p-3 rounded-xl shadow-2xl border border-white/10 text-xs space-y-1">
                        <p className="font-bold text-slate-200">{data.weekLabel}</p>
                        <p className="text-sky-400 font-extrabold">Response Rate: {data.responseRate}%</p>
                        <p className="text-slate-300">Pitches: {data.pitches} • Responses: {data.responses}</p>
                        <p className="text-emerald-400">Closed Clients: {data.clients} ({formatCurrency(data.revenue, settings.currencySymbol)})</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="responseRate" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
};
