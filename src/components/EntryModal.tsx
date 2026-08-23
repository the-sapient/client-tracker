import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  MessageSquare, 
  Users, 
  FileText, 
  DollarSign, 
  Calendar, 
  Coffee, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  Tag,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { ChallengeSettings, DailyEntry, FollowUpItem } from '../types';
import { formatCurrency, formatPrettyDate } from '../utils/calculations';

interface EntryModalProps {
  isOpen: boolean;
  date: string;
  initialEntry?: DailyEntry;
  settings: ChallengeSettings;
  onClose: () => void;
  onSave: (entry: DailyEntry) => void;
  dayNumber: number;
}

export const EntryModal: React.FC<EntryModalProps> = ({
  isOpen,
  date,
  initialEntry,
  settings,
  onClose,
  onSave,
  dayNumber
}) => {
  const [pitches, setPitches] = useState(initialEntry?.pitches || 0);
  const [responses, setResponses] = useState(initialEntry?.responses || 0);
  const [positiveResponses, setPositiveResponses] = useState(initialEntry?.positiveResponses || 0);
  const [meetings, setMeetings] = useState(initialEntry?.meetings || 0);
  const [proposals, setProposals] = useState(initialEntry?.proposals || 0);
  const [clientsClosed, setClientsClosed] = useState(initialEntry?.clientsClosed || 0);
  const [revenue, setRevenue] = useState(initialEntry?.revenue || 0);
  const [channels, setChannels] = useState<string[]>(initialEntry?.channels || []);
  const [notes, setNotes] = useState(initialEntry?.notes || '');
  const [isRestDay, setIsRestDay] = useState(initialEntry?.isRestDay || false);
  
  // Follow up tasks
  const [followUps, setFollowUps] = useState<FollowUpItem[]>(initialEntry?.followUps || []);
  const [newFollowUpText, setNewFollowUpText] = useState('');

  // Sync state if initialEntry changes
  useEffect(() => {
    if (initialEntry) {
      setPitches(initialEntry.pitches);
      setResponses(initialEntry.responses);
      setPositiveResponses(initialEntry.positiveResponses);
      setMeetings(initialEntry.meetings);
      setProposals(initialEntry.proposals);
      setClientsClosed(initialEntry.clientsClosed);
      setRevenue(initialEntry.revenue);
      setChannels(initialEntry.channels || []);
      setNotes(initialEntry.notes || '');
      setIsRestDay(initialEntry.isRestDay || false);
      setFollowUps(initialEntry.followUps || []);
    } else {
      setPitches(0);
      setResponses(0);
      setPositiveResponses(0);
      setMeetings(0);
      setProposals(0);
      setClientsClosed(0);
      setRevenue(0);
      setChannels([]);
      setNotes('');
      setIsRestDay(false);
      setFollowUps([]);
    }
  }, [initialEntry, date]);

  if (!isOpen) return null;

  const toggleChannel = (channelName: string) => {
    if (channels.includes(channelName)) {
      setChannels(channels.filter(c => c !== channelName));
    } else {
      setChannels([...channels, channelName]);
    }
  };

  const addFollowUp = () => {
    if (!newFollowUpText.trim()) return;
    const newItem: FollowUpItem = {
      id: Date.now().toString(),
      text: newFollowUpText.trim(),
      completed: false
    };
    setFollowUps([...followUps, newItem]);
    setNewFollowUpText('');
  };

  const removeFollowUp = (id: string) => {
    setFollowUps(followUps.filter(f => f.id !== id));
  };

  const toggleFollowUp = (id: string) => {
    setFollowUps(followUps.map(f => f.id === id ? { ...f, completed: !f.completed } : f));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: DailyEntry = {
      id: initialEntry?.id || `entry-${date}`,
      date,
      pitches: isRestDay ? 0 : Math.max(0, Number(pitches) || 0),
      responses: isRestDay ? 0 : Math.max(0, Number(responses) || 0),
      positiveResponses: isRestDay ? 0 : Math.max(0, Number(positiveResponses) || 0),
      meetings: isRestDay ? 0 : Math.max(0, Number(meetings) || 0),
      proposals: isRestDay ? 0 : Math.max(0, Number(proposals) || 0),
      clientsClosed: Math.max(0, Number(clientsClosed) || 0),
      revenue: Math.max(0, Number(revenue) || 0),
      channels: isRestDay ? [] : channels,
      notes: notes.trim(),
      isRestDay,
      followUps,
      createdAt: initialEntry?.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    onSave(entry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#121216] rounded-2xl max-w-2xl w-full my-8 shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#16161A] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
              D{dayNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100">
                  {initialEntry ? 'Edit Day Log' : 'Log Outreach Activity'}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                  Day {dayNumber} of 100
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {formatPrettyDate(date)}
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
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          
          {/* Rest Day Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-[#16161A] rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isRestDay ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-slate-400'}`}>
                <Coffee className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-200 block">Mark as Rest / Strategy Day</span>
                <span className="text-xs text-slate-400">Rest days preserve your active pitch pace metrics.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsRestDay(!isRestDay)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isRestDay ? 'bg-purple-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isRestDay ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {!isRestDay && (
            <>
              {/* Funnel Metrics Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Daily Conversion Metrics
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  
                  {/* Pitches */}
                  <div className="bg-[#16161A] p-3.5 rounded-xl border border-white/10">
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>Pitches Sent</span>
                      <Send className="h-3.5 w-3.5 text-emerald-400" />
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={pitches || ''}
                      onChange={(e) => setPitches(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full bg-[#0F0F12] border border-white/10 rounded-lg px-3 py-1.5 text-base font-bold text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      required
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Goal: {settings.targetDailyPitches}/day</span>
                  </div>

                  {/* Total Responses */}
                  <div className="bg-[#16161A] p-3.5 rounded-xl border border-white/10">
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>Responses</span>
                      <MessageSquare className="h-3.5 w-3.5 text-sky-400" />
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={responses || ''}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        setResponses(val);
                        if (positiveResponses > val) setPositiveResponses(val);
                      }}
                      placeholder="0"
                      className="w-full bg-[#0F0F12] border border-white/10 rounded-lg px-3 py-1.5 text-base font-bold text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Any reply received</span>
                  </div>

                  {/* Positive Responses */}
                  <div className="bg-[#16161A] p-3.5 rounded-xl border border-white/10">
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>Positive / Warm</span>
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={responses}
                      value={positiveResponses || ''}
                      onChange={(e) => setPositiveResponses(Math.min(responses, Math.max(0, parseInt(e.target.value) || 0)))}
                      placeholder="0"
                      className="w-full bg-[#0F0F12] border border-white/10 rounded-lg px-3 py-1.5 text-base font-bold text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Interested leads</span>
                  </div>

                  {/* Meetings */}
                  <div className="bg-[#16161A] p-3.5 rounded-xl border border-white/10">
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>Calls / Meetings</span>
                      <Users className="h-3.5 w-3.5 text-teal-400" />
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={meetings || ''}
                      onChange={(e) => setMeetings(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full bg-[#0F0F12] border border-white/10 rounded-lg px-3 py-1.5 text-base font-bold text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Discovery calls held</span>
                  </div>

                  {/* Proposals */}
                  <div className="bg-[#16161A] p-3.5 rounded-xl border border-white/10">
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>Proposals Sent</span>
                      <FileText className="h-3.5 w-3.5 text-indigo-400" />
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={proposals || ''}
                      onChange={(e) => setProposals(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full bg-[#0F0F12] border border-white/10 rounded-lg px-3 py-1.5 text-base font-bold text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Quotes submitted</span>
                  </div>

                  {/* Clients Closed */}
                  <div className="bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20">
                    <label className="block text-xs font-bold text-emerald-400 mb-1 flex items-center justify-between">
                      <span>Clients Won</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={clientsClosed || ''}
                      onChange={(e) => setClientsClosed(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full bg-[#0F0F12] border border-emerald-500/40 rounded-lg px-3 py-1.5 text-base font-bold text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-emerald-400 mt-1 block">Deals signed today</span>
                  </div>

                </div>
              </div>

              {/* Revenue Input */}
              <div className="bg-[#16161A] p-4 rounded-xl border border-white/10">
                <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                  <span>Revenue Closed Today ({settings.currencySymbol})</span>
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    {settings.currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={revenue || ''}
                    onChange={(e) => setRevenue(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 bg-[#0F0F12] border border-white/10 rounded-lg text-lg font-black text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <span className="text-xs text-slate-400 mt-1 block">
                  Add full contract or initial deposit revenue booked today.
                </span>
              </div>

              {/* Channels Tagging */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> Channels Used Today
                </label>
                <div className="flex flex-wrap gap-2">
                  {settings.channels.map((ch) => {
                    const isSelected = channels.includes(ch.name);
                    return (
                      <button
                        type="button"
                        key={ch.id}
                        onClick={() => toggleChannel(ch.name)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                            : 'bg-[#16161A] text-slate-400 border border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
                        <span>{ch.name}</span>
                        {isSelected && <Check className="h-3 w-3 ml-0.5 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Notes / Learnings */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Daily Reflection & Win / Obstacle Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What angle/script worked best today? What objections came up? Any notable warm leads?"
              className="w-full bg-[#0F0F12] border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Action Items / Follow-ups */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Follow-up Reminders & Tasks
            </label>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newFollowUpText}
                onChange={(e) => setNewFollowUpText(e.target.value)}
                placeholder="e.g., Follow up with Acme Corp on Tuesday..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFollowUp();
                  }
                }}
                className="flex-1 bg-[#0F0F12] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={addFollowUp}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 text-slate-200 hover:bg-white/15 hover:text-white border border-white/10 transition-colors shrink-0 cursor-pointer"
              >
                Add
              </button>
            </div>

            {followUps.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {followUps.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-[#16161A] border border-white/10 text-xs">
                    <div 
                      onClick={() => toggleFollowUp(item.id)}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <div className={`h-4 w-4 rounded flex items-center justify-center ${
                        item.completed ? 'bg-emerald-500 text-slate-950 font-bold' : 'border border-slate-600'
                      }`}>
                        {item.completed && <Check className="h-3 w-3" />}
                      </div>
                      <span className={item.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                        {item.text}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFollowUp(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
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
              Save Day Log
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
