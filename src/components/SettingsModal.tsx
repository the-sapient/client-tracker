import React, { useState, useRef } from 'react';
import { 
  X, 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Plus, 
  Check, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  Target, 
  Tag, 
  Database,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { ChallengeSettings, ChannelConfig, DailyEntry } from '../types';
import { addDays, formatPrettyDate } from '../utils/calculations';
import { exportToJson, exportToCsv, importFromJson, generateSampleEntries } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  settings: ChallengeSettings;
  entries: DailyEntry[];
  onClose: () => void;
  onSaveSettings: (newSettings: ChallengeSettings) => void;
  onImportData: (importedSettings: ChallengeSettings, importedEntries: DailyEntry[]) => void;
  onResetData: () => void;
  onLoadSampleData: () => void;
}

const COLOR_PALETTE = [
  '#3b82f6', // blue
  '#0284c7', // sky
  '#8b5cf6', // violet
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#64748b', // slate
  '#ef4444'  // red
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  entries,
  onClose,
  onSaveSettings,
  onImportData,
  onResetData,
  onLoadSampleData
}) => {
  const [startDate, setStartDate] = useState(settings.startDate);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [currencyCode, setCurrencyCode] = useState(settings.currencyCode);
  const [targetClients, setTargetClients] = useState(settings.targetClients);
  const [targetRevenue, setTargetRevenue] = useState(settings.targetRevenue);
  const [targetDailyPitches, setTargetDailyPitches] = useState(settings.targetDailyPitches);
  const [channels, setChannels] = useState<ChannelConfig[]>(settings.channels);
  
  // New channel state
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelColor, setNewChannelColor] = useState(COLOR_PALETTE[3]);
  
  // Danger zone state
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const endDate = addDays(startDate, 99);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      startDate,
      currencySymbol,
      currencyCode,
      targetClients: Math.max(1, Number(targetClients) || 1),
      targetRevenue: Math.max(0, Number(targetRevenue) || 0),
      targetDailyPitches: Math.max(1, Number(targetDailyPitches) || 1),
      channels
    });
    onClose();
  };

  const handleAddChannel = () => {
    if (!newChannelName.trim()) return;
    const newId = newChannelName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (channels.some(c => c.id === newId || c.name.toLowerCase() === newChannelName.trim().toLowerCase())) {
      return;
    }

    const newChan: ChannelConfig = {
      id: newId,
      name: newChannelName.trim(),
      color: newChannelColor
    };

    setChannels([...channels, newChan]);
    setNewChannelName('');
  };

  const handleRemoveChannel = (id: string) => {
    if (channels.length <= 1) return; // Keep at least 1 channel
    setChannels(channels.filter(c => c.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importFromJson(content);
      if (result.success && result.settings && result.entries) {
        onImportData(result.settings, result.entries);
        setImportSuccess(`Successfully imported ${result.entries.length} entries!`);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setImportError(result.error || 'Failed to parse import file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#121216] rounded-2xl max-w-2xl w-full my-8 shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh] text-slate-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#16161A] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                Challenge Goals & Settings
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure start dates, revenue targets, outreach tags, and data backups.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Section 1: Dates & Currency */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-emerald-400" /> Challenge Timeline & Currency
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Challenge Start Date (Day 1)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#0F0F12] border border-white/10 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Day 100 will end on <strong className="text-slate-300">{formatPrettyDate(endDate)}</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Currency Symbol & Code
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="bg-[#0F0F12] border border-white/10 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="$">$ (USD/CAD/AUD)</option>
                    <option value="€">€ (EUR)</option>
                    <option value="£">£ (GBP)</option>
                    <option value="₦">₦ (NGN)</option>
                    <option value="¥">¥ (JPY/CNY)</option>
                    <option value="₹">₹ (INR)</option>
                    <option value="R">R (ZAR)</option>
                    <option value="CHF">CHF</option>
                  </select>

                  <input
                    type="text"
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                    placeholder="USD"
                    maxLength={4}
                    className="bg-[#0F0F12] border border-white/10 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Goals & Targets */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-emerald-400" /> 100-Day Performance Goals
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              
              <div className="bg-[#16161A] p-3.5 rounded-xl border border-white/10">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Target Daily Pitches
                </label>
                <input
                  type="number"
                  min="1"
                  value={targetDailyPitches}
                  onChange={(e) => setTargetDailyPitches(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#0F0F12] border border-white/10 rounded-lg px-2.5 py-1.5 text-sm font-bold text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  e.g. 15 pitches/day
                </span>
              </div>

              <div className="bg-[#16161A] p-3.5 rounded-xl border border-white/10">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Target Clients to Close
                </label>
                <input
                  type="number"
                  min="1"
                  value={targetClients}
                  onChange={(e) => setTargetClients(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#0F0F12] border border-white/10 rounded-lg px-2.5 py-1.5 text-sm font-bold text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  by Day 100
                </span>
              </div>

              <div className="bg-[#16161A] p-3.5 rounded-xl border border-white/10">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Target Total Revenue
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={targetRevenue}
                    onChange={(e) => setTargetRevenue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0F0F12] border border-white/10 rounded-lg pl-6 pr-2.5 py-1.5 text-sm font-bold text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-right"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Total challenge revenue
                </span>
              </div>

            </div>
          </div>

          {/* Section 3: Outreach Channels Manager */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-emerald-400" /> Outreach Channels & Tagging
            </h4>

            {/* Existing Channels */}
            <div className="flex flex-wrap gap-2">
              {channels.map((ch) => (
                <div 
                  key={ch.id} 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#16161A] text-slate-200 border border-white/10"
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
                  <span>{ch.name}</span>
                  {channels.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveChannel(ch.id)}
                      className="text-slate-500 hover:text-rose-400 ml-1 cursor-pointer"
                      title="Remove channel"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Channel */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="New channel name (e.g. YouTube, Podcast Outreach)..."
                className="flex-1 bg-[#0F0F12] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />

              <div className="flex items-center gap-1">
                {COLOR_PALETTE.slice(0, 5).map(c => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setNewChannelColor(c)}
                    className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                      newChannelColor === c ? 'scale-125 ring-2 ring-emerald-500 ring-offset-1 ring-offset-[#121216] border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddChannel}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-slate-200 hover:bg-white/15 hover:text-white border border-white/10 transition-colors shrink-0 cursor-pointer"
              >
                Add Channel
              </button>
            </div>
          </div>

          {/* Section 4: Data Backup & Management */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-emerald-400" /> Data Backup & Restore
            </h4>

            {importSuccess && (
              <div className="p-3 bg-emerald-500/15 text-emerald-300 rounded-xl border border-emerald-500/30 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{importSuccess}</span>
              </div>
            )}

            {importError && (
              <div className="p-3 bg-rose-500/15 text-rose-300 rounded-xl border border-rose-500/30 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Export JSON */}
              <button
                type="button"
                onClick={() => exportToJson(settings, entries)}
                className="flex items-center justify-between p-3 rounded-xl bg-[#16161A] border border-white/10 hover:bg-white/5 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-emerald-400" />
                  <span>Export JSON Backup</span>
                </div>
                <span className="text-[10px] text-slate-500">Full backup</span>
              </button>

              {/* Export CSV */}
              <button
                type="button"
                onClick={() => exportToCsv(settings, entries)}
                className="flex items-center justify-between p-3 rounded-xl bg-[#16161A] border border-white/10 hover:bg-white/5 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-sky-400" />
                  <span>Export CSV Spreadsheet</span>
                </div>
                <span className="text-[10px] text-slate-500">Excel / Sheets</span>
              </button>

              {/* Import JSON */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-between p-3 rounded-xl bg-[#16161A] border border-white/10 hover:bg-white/5 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-teal-400" />
                  <span>Import JSON Backup</span>
                </div>
                <span className="text-[10px] text-slate-500">Restore file</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Load Sample Data */}
              <button
                type="button"
                onClick={onLoadSampleData}
                className="flex items-center justify-between p-3 rounded-xl bg-[#16161A] border border-white/10 hover:bg-white/5 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Load Sample Demo Data</span>
                </div>
                <span className="text-[10px] text-slate-500">24 days demo</span>
              </button>
            </div>

            {/* Danger Zone: Reset Data */}
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-300 block">
                    Reset & Clear All Tracker Data
                  </span>
                  <span className="text-[11px] text-rose-400/80">
                    Permanently wipe all logged days, pitches, and revenue.
                  </span>
                </div>

                {!showResetConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    Reset Data
                  </button>
                )}
              </div>

              {showResetConfirm && (
                <div className="pt-2 border-t border-rose-500/20 space-y-2">
                  <p className="text-xs text-rose-300 font-semibold">
                    Type <strong className="text-white">RESET</strong> below to confirm wiping all data:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={resetConfirmText}
                      onChange={(e) => setResetConfirmText(e.target.value)}
                      placeholder="Type RESET"
                      className="bg-[#0F0F12] border border-rose-500/40 rounded-lg px-3 py-1 text-xs text-slate-100 font-bold focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      disabled={resetConfirmText !== 'RESET'}
                      onClick={() => {
                        onResetData();
                        setShowResetConfirm(false);
                        setResetConfirmText('');
                        onClose();
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      Confirm Wipe
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetConfirm(false);
                        setResetConfirmText('');
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition-all cursor-pointer active:scale-98"
            >
              Save Settings
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
