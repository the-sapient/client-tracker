import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Download, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Coffee, 
  ChevronRight,
  Sparkles,
  Check
} from 'lucide-react';
import { DailyEntry, ChallengeSettings } from '../types';
import { formatCurrency, formatPrettyDate } from '../utils/calculations';
import { exportToCsv } from '../utils/storage';

interface HistoryListProps {
  entries: DailyEntry[];
  settings: ChallengeSettings;
  onEditEntry: (date: string) => void;
  onDeleteEntry: (date: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  entries,
  settings,
  onEditEntry,
  onDeleteEntry
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'clients' | 'rest'>('all');

  // Filter entries
  const filteredEntries = [...entries]
    .sort((a, b) => b.date.localeCompare(a.date)) // newest first
    .filter((entry) => {
      // Search in notes or channels
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesNotes = entry.notes?.toLowerCase().includes(query);
        const matchesChannels = entry.channels?.some(c => c.toLowerCase().includes(query));
        const matchesDate = entry.date.includes(query);
        if (!matchesNotes && !matchesChannels && !matchesDate) return false;
      }

      // Filter by channel
      if (filterChannel !== 'all') {
        if (!entry.channels?.includes(filterChannel)) return false;
      }

      // Filter by type
      if (filterType === 'clients' && entry.clientsClosed <= 0) return false;
      if (filterType === 'rest' && !entry.isRestDay) return false;

      return true;
    });

  return (
    <div className="bg-[#121216] rounded-2xl p-5 sm:p-6 border border-white/10 shadow-xs space-y-5">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-100">Outreach Entries & Daily Logs</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {entries.length} Days Logged
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Search, review, edit, or delete any past daily challenge log.
          </p>
        </div>

        <button
          onClick={() => exportToCsv(settings, entries)}
          className="inline-flex items-center self-start sm:self-auto px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white border border-white/10 transition-colors shadow-xs cursor-pointer"
        >
          <Download className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, channels, or date..."
            className="w-full pl-9 pr-3 py-2 bg-[#16161A] border border-white/10 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* Channel Filter */}
        <div>
          <select
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            className="w-full px-3 py-2 bg-[#16161A] border border-white/10 rounded-xl text-xs sm:text-sm font-medium text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="all">All Channels</option>
            {settings.channels.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full px-3 py-2 bg-[#16161A] border border-white/10 rounded-xl text-xs sm:text-sm font-medium text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="all">All Entry Types</option>
            <option value="clients">★ Closed Clients Only</option>
            <option value="rest">☕ Rest Days Only</option>
          </select>
        </div>
      </div>

      {/* Entries Table */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-12 space-y-2 border border-white/5 rounded-2xl bg-[#16161A]/50">
          <History className="h-8 w-8 mx-auto text-slate-600" />
          <p className="text-sm font-semibold text-slate-400">No logs found matching your filter.</p>
          <p className="text-xs text-slate-600">Try adjusting your search query or channel filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[11px] font-bold">
                <th className="pb-3 pr-3">Date</th>
                <th className="pb-3 px-3 text-right">Pitches</th>
                <th className="pb-3 px-3 text-right">Replies</th>
                <th className="pb-3 px-3 text-right">Calls</th>
                <th className="pb-3 px-3 text-right">Clients</th>
                <th className="pb-3 px-3 text-right">Revenue</th>
                <th className="pb-3 px-3">Channels & Notes</th>
                <th className="pb-3 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEntries.map((entry) => (
                <tr key={entry.date} className="hover:bg-white/[0.03] transition-colors group">
                  
                  {/* Date */}
                  <td className="py-3.5 pr-3 font-semibold text-slate-100 whitespace-nowrap">
                    <div>{formatPrettyDate(entry.date)}</div>
                    {entry.isRestDay && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-900/30 text-purple-300 border border-purple-500/30 mt-0.5">
                        ☕ Rest Day
                      </span>
                    )}
                  </td>

                  {/* Pitches */}
                  <td className="py-3.5 px-3 text-right font-medium text-slate-200">
                    {entry.isRestDay ? '—' : entry.pitches}
                  </td>

                  {/* Replies */}
                  <td className="py-3.5 px-3 text-right font-medium text-slate-200">
                    {entry.isRestDay ? '—' : (
                      <span>
                        {entry.responses}
                        {entry.positiveResponses > 0 && (
                          <span className="text-[11px] text-sky-400 font-semibold block">
                            ({entry.positiveResponses} warm)
                          </span>
                        )}
                      </span>
                    )}
                  </td>

                  {/* Meetings */}
                  <td className="py-3.5 px-3 text-right font-medium text-slate-200">
                    {entry.isRestDay ? '—' : entry.meetings}
                  </td>

                  {/* Clients */}
                  <td className="py-3.5 px-3 text-right font-bold text-white">
                    {entry.clientsClosed > 0 ? (
                      <span className="text-emerald-400 font-extrabold flex items-center justify-end gap-1">
                        ★ {entry.clientsClosed}
                      </span>
                    ) : (
                      '0'
                    )}
                  </td>

                  {/* Revenue */}
                  <td className="py-3.5 px-3 text-right font-extrabold text-emerald-400 whitespace-nowrap">
                    {entry.revenue > 0 ? formatCurrency(entry.revenue, settings.currencySymbol) : '—'}
                  </td>

                  {/* Channels & Notes snippet */}
                  <td className="py-3.5 px-3 text-xs max-w-xs">
                    {entry.channels && entry.channels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {entry.channels.map(ch => (
                          <span key={ch} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/5 text-slate-300 border border-white/5">
                            {ch}
                          </span>
                        ))}
                      </div>
                    )}
                    {entry.notes && (
                      <p className="text-slate-400 truncate text-[11px]" title={entry.notes}>
                        {entry.notes}
                      </p>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 pl-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEditEntry(entry.date)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-white/5 transition-colors cursor-pointer"
                        title="Edit Entry"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete log entry for ${entry.date}?`)) {
                            onDeleteEntry(entry.date);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                        title="Delete Entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
