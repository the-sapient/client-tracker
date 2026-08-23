import React from 'react';
import { 
  Filter, 
  ArrowDown, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  DollarSign, 
  Users, 
  Send,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { ChallengeMetrics, ChallengeSettings, ChannelSummary, FunnelStage } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';

interface FunnelAndChannelsProps {
  metrics: ChallengeMetrics;
  settings: ChallengeSettings;
  funnelData: FunnelStage[];
  channelSummaries: ChannelSummary[];
}

export const FunnelAndChannels: React.FC<FunnelAndChannelsProps> = ({
  metrics,
  settings,
  funnelData,
  channelSummaries
}) => {
  // Find top channels
  const topRevenueChannel = [...channelSummaries].sort((a, b) => b.revenue - a.revenue)[0];
  const topResponseChannel = [...channelSummaries].filter(c => c.pitches >= 10).sort((a, b) => b.responseRate - a.responseRate)[0];

  return (
    <div className="space-y-6">
      
      {/* 1. Client Acquisition Funnel */}
      <div className="bg-[#121216] rounded-2xl p-5 sm:p-6 border border-white/10 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-100">Client Acquisition Funnel</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                End-to-End Pipeline
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live conversion rates and drop-off analysis from initial pitch to closed client.
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-300 bg-[#16161A] px-3 py-1.5 rounded-xl border border-white/10">
            Overall Conversion: <strong className="text-emerald-400">{formatPercent(metrics.overallConversionRate)}</strong> (Pitches to Clients)
          </div>
        </div>

        {/* Funnel Stage Cards */}
        <div className="space-y-3">
          {funnelData.map((stage, idx) => {
            const maxCount = Math.max(1, funnelData[0].count);
            const widthPercent = Math.max(10, (stage.count / maxCount) * 100);

            return (
              <div key={stage.name} className="relative">
                <div className="bg-[#16161A] rounded-xl p-4 border border-white/5 hover:border-white/15 transition-colors">
                  
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center justify-center h-6 w-6 rounded-lg text-xs font-bold text-white shadow-xs" style={{ backgroundColor: stage.color }}>
                        {idx + 1}
                      </span>
                      <span className="text-sm font-bold text-slate-100">{stage.name}</span>
                    </div>

                    <div className="flex items-baseline gap-3 text-right">
                      <span className="text-lg font-extrabold text-white">
                        {stage.count.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({formatPercent(stage.conversionFromTop)} of total)
                      </span>
                    </div>
                  </div>

                  {/* Funnel bar */}
                  <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor: stage.color
                      }}
                    />
                  </div>

                  {/* Conversion from previous step sub-row */}
                  {idx > 0 && (
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/5">
                      <span>Conversion from {funnelData[idx - 1].name}:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">
                          {formatPercent(stage.conversionFromPrev)}
                        </span>
                        {stage.dropOff > 0 && (
                          <span className="text-slate-500 text-[11px]">
                            ({stage.dropOff.toLocaleString()} drop-off)
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Outreach Channel Performance */}
      <div className="bg-[#121216] rounded-2xl p-5 sm:p-6 border border-white/10 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-100">Outreach Channel Breakdown</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Channel ROI
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Identify your most effective channels for response rates and revenue generation.
            </p>
          </div>
        </div>

        {/* Highlight Insights */}
        {(topRevenueChannel?.revenue > 0 || topResponseChannel?.responseRate > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topResponseChannel && (
              <div className="bg-sky-500/10 rounded-xl p-3.5 border border-sky-500/20 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-sky-500 text-slate-950 font-bold shrink-0">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-sky-300 block">
                    Highest Response Rate: {topResponseChannel.channel}
                  </span>
                  <p className="text-xs text-sky-200/80 mt-0.5">
                    <strong className="text-white">{formatPercent(topResponseChannel.responseRate)}</strong> response rate across {topResponseChannel.pitches} pitches.
                  </p>
                </div>
              </div>
            )}

            {topRevenueChannel && topRevenueChannel.revenue > 0 && (
              <div className="bg-emerald-500/10 rounded-xl p-3.5 border border-emerald-500/20 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500 text-slate-950 font-bold shrink-0">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-300 block">
                    Top Revenue Driver: {topRevenueChannel.channel}
                  </span>
                  <p className="text-xs text-emerald-200/80 mt-0.5">
                    Generated <strong className="text-emerald-400">{formatCurrency(topRevenueChannel.revenue, settings.currencySymbol)}</strong> across {topRevenueChannel.clients} closed client(s).
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Channels Table / Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[11px] font-bold">
                <th className="pb-3 pr-4">Channel</th>
                <th className="pb-3 px-3 text-right">Pitches</th>
                <th className="pb-3 px-3 text-right">Responses</th>
                <th className="pb-3 px-3 text-right">Resp. Rate</th>
                <th className="pb-3 px-3 text-right">Meetings</th>
                <th className="pb-3 px-3 text-right">Clients</th>
                <th className="pb-3 pl-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {channelSummaries.map((ch) => (
                <tr key={ch.channel} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-3.5 pr-4 font-semibold text-slate-100 flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: ch.color }} />
                    <span>{ch.channel}</span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-medium text-slate-300">
                    {ch.pitches.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right font-medium text-slate-300">
                    {ch.responses}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                      ch.responseRate >= 25 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                      ch.responseRate >= 15 ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'bg-white/5 text-slate-400 border border-white/5'
                    }`}>
                      {formatPercent(ch.responseRate)}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-medium text-slate-300">
                    {ch.meetings}
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-white">
                    {ch.clients}
                  </td>
                  <td className="py-3.5 pl-3 text-right font-extrabold text-emerald-400">
                    {formatCurrency(ch.revenue, settings.currencySymbol)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
