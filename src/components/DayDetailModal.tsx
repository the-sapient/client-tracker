import React from 'react';
import { 
  X, 
  Edit3, 
  PlusCircle, 
  Send, 
  MessageSquare, 
  Users, 
  DollarSign, 
  Coffee, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  Check
} from 'lucide-react';
import { DayInfo, ChallengeSettings } from '../types';
import { formatCurrency, formatPrettyDate } from '../utils/calculations';

interface DayDetailModalProps {
  day: DayInfo | null;
  settings: ChallengeSettings;
  onClose: () => void;
  onEdit: (date: string) => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  day,
  settings,
  onClose,
  onEdit
}) => {
  if (!day) return null;

  const entry = day.entry;
  const isRest = entry?.isRestDay || day.status === 'rest';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#121216] rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-white/10 space-y-5 text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-black text-sm shadow-xs ${
              isRest ? 'bg-purple-600 text-white' :
              day.status === 'missed' ? 'bg-amber-500 text-slate-950' :
              entry && entry.clientsClosed > 0 ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
            }`}>
              D{day.dayNumber}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                {formatPrettyDate(day.dateStr)}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  day.isToday ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  isRest ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30' :
                  day.status === 'missed' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  day.status === 'active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                  'bg-white/5 text-slate-400 border border-white/5'
                }`}>
                  {day.isToday ? '● Today' :
                   isRest ? '☕ Rest Day' :
                   day.status === 'missed' ? '⚠ Missed Day' :
                   day.status === 'active' ? '✓ Active Outreach' : 'Upcoming'}
                </span>
                {day.dayNumber <= 100 && (
                  <span className="text-xs text-slate-500">Day {day.dayNumber} of 100</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        {entry ? (
          <div className="space-y-4">
            {entry.isRestDay ? (
              <div className="bg-purple-950/40 rounded-xl p-4 border border-purple-500/30 text-purple-200">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Coffee className="h-4 w-4 text-purple-400" />
                  <span>Scheduled Rest & Strategy Day</span>
                </div>
                <p className="text-xs text-purple-300/80 mt-1">
                  No outreach pitches were scheduled for this day.
                </p>
              </div>
            ) : (
              <>
                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-[#16161A] p-2.5 rounded-xl border border-white/10 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Pitches</span>
                    <span className="text-lg font-extrabold text-white">{entry.pitches}</span>
                  </div>
                  <div className="bg-[#16161A] p-2.5 rounded-xl border border-white/10 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Replies</span>
                    <span className="text-lg font-extrabold text-white">{entry.responses}</span>
                    <span className="text-[10px] text-sky-400 block">({entry.positiveResponses} warm)</span>
                  </div>
                  <div className="bg-[#16161A] p-2.5 rounded-xl border border-white/10 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Meetings</span>
                    <span className="text-lg font-extrabold text-white">{entry.meetings}</span>
                  </div>
                  <div className="bg-[#16161A] p-2.5 rounded-xl border border-white/10 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Proposals</span>
                    <span className="text-lg font-extrabold text-white">{entry.proposals}</span>
                  </div>
                  <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">Clients Won</span>
                    <span className="text-lg font-extrabold text-emerald-300">{entry.clientsClosed}</span>
                  </div>
                  <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">Revenue</span>
                    <span className="text-base font-extrabold text-emerald-300">
                      {formatCurrency(entry.revenue, settings.currencySymbol)}
                    </span>
                  </div>
                </div>

                {/* Channels Used */}
                {entry.channels && entry.channels.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Channels
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.channels.map(ch => (
                        <span key={ch} className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-white/5 text-slate-300 border border-white/10">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Notes */}
            {entry.notes && (
              <div className="bg-[#16161A] p-3.5 rounded-xl border border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Reflection / Notes
                </span>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {entry.notes}
                </p>
              </div>
            )}

            {/* Follow Ups */}
            {entry.followUps && entry.followUps.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Action Items
                </span>
                <div className="space-y-1">
                  {entry.followUps.map(fu => (
                    <div key={fu.id} className="flex items-center gap-2 text-xs text-slate-300 bg-[#16161A] px-2.5 py-1.5 rounded-lg border border-white/10">
                      <div className={`h-3.5 w-3.5 rounded flex items-center justify-center ${
                        fu.completed ? 'bg-emerald-500 text-slate-950 font-bold' : 'border border-slate-600'
                      }`}>
                        {fu.completed && <Check className="h-2.5 w-2.5" />}
                      </div>
                      <span className={fu.completed ? 'line-through text-slate-500' : 'font-medium'}>
                        {fu.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="text-center py-6 space-y-3 bg-[#16161A] rounded-xl border border-white/10 p-4">
            <div className="inline-flex p-3 rounded-full bg-white/5 text-slate-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200">
                {day.status === 'missed' ? 'No Entry Logged' : 'Upcoming Challenge Day'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {day.status === 'missed'
                  ? 'This day has passed with 0 outreach logged. You can log it late or mark as rest.'
                  : 'Log outreach activity for this day once completed.'}
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              onEdit(day.dateStr);
              onClose();
            }}
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 active:scale-98 cursor-pointer"
          >
            {entry ? <Edit3 className="h-4 w-4 mr-1.5 stroke-[2.5]" /> : <PlusCircle className="h-4 w-4 mr-1.5 stroke-[2.5]" />}
            <span>{entry ? 'Edit This Day' : 'Log This Day'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
