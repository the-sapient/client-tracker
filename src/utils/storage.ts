import { ChallengeSettings, DailyEntry } from '../types';
import { addDays, formatDate, parseDate, diffInDays } from './calculations';

export const STORAGE_KEYS = {
  SETTINGS: 'client_acquisition_100_settings',
  ENTRIES: 'client_acquisition_100_entries',
  INITIALIZED: 'client_acquisition_100_initialized'
};

export const DEFAULT_CHANNELS = [
  { id: 'cold_email', name: 'Cold Email', color: '#3b82f6' }, // blue
  { id: 'linkedin', name: 'LinkedIn', color: '#0284c7' }, // sky
  { id: 'cold_call', name: 'Cold Call', color: '#8b5cf6' }, // violet
  { id: 'referral', name: 'Referral', color: '#10b981' }, // emerald
  { id: 'social', name: 'Social / X / IG', color: '#f59e0b' }, // amber
  { id: 'in_person', name: 'In-Person / Events', color: '#ec4899' }, // pink
  { id: 'upwork', name: 'Freelance Platforms', color: '#14b8a6' }, // teal
  { id: 'other', name: 'Other', color: '#64748b' } // slate
];

export function getDefaultSettings(startDateStr?: string): ChallengeSettings {
  // If not provided, calculate a start date roughly 23 days ago so user lands right on "Day 24 of 100" with rich context, or today if unset
  const defaultStart = startDateStr || addDays(formatDate(new Date()), -23);

  return {
    startDate: defaultStart,
    currencySymbol: '$',
    currencyCode: 'USD',
    targetClients: 12,
    targetRevenue: 30000,
    targetDailyPitches: 15,
    channels: DEFAULT_CHANNELS
  };
}

/**
 * Generate realistic sample data of 24 days of challenge activity
 */
export function generateSampleEntries(startDateStr: string): DailyEntry[] {
  const entries: DailyEntry[] = [];
  const start = parseDate(startDateStr);

  const sampleLogs = [
    // Day 1
    { dayOffset: 0, pitches: 12, responses: 2, pos: 1, meet: 0, prop: 0, closed: 0, rev: 0, channels: ['Cold Email', 'LinkedIn'], notes: 'Day 1 kickoff! Focused on tech startups in Europe. Good deliverability.' },
    // Day 2
    { dayOffset: 1, pitches: 15, responses: 3, pos: 2, meet: 1, prop: 0, closed: 0, rev: 0, channels: ['Cold Email', 'LinkedIn'], notes: 'Booked first discovery call with a SaaS founder for Thursday.' },
    // Day 3
    { dayOffset: 2, pitches: 16, responses: 4, pos: 2, meet: 1, prop: 0, closed: 0, rev: 0, channels: ['Cold Email'], notes: 'Refined subject line to mention specific growth bottlenecks.' },
    // Day 4
    { dayOffset: 3, pitches: 14, responses: 2, pos: 1, meet: 0, prop: 1, closed: 0, rev: 0, channels: ['LinkedIn'], notes: 'Sent proposal after follow up from previous client intro.' },
    // Day 5 (Friday)
    { dayOffset: 4, pitches: 18, responses: 5, pos: 3, meet: 2, prop: 0, closed: 0, rev: 0, channels: ['Cold Email', 'Referral'], notes: 'High response rate on Friday morning outreach!' },
    // Day 6 (Saturday - Rest)
    { dayOffset: 5, isRest: true, pitches: 0, responses: 0, pos: 0, meet: 0, prop: 0, closed: 0, rev: 0, channels: [], notes: 'Weekend rest day. Recharge and review pitch list for next week.' },
    // Day 7 (Sunday - Rest)
    { dayOffset: 6, isRest: true, pitches: 0, responses: 0, pos: 0, meet: 0, prop: 0, closed: 0, rev: 0, channels: [], notes: 'Prepared 50 verified lead contacts.' },
    // Day 8 (Monday - Week 2)
    { dayOffset: 7, pitches: 20, responses: 4, pos: 2, meet: 1, prop: 0, closed: 0, rev: 0, channels: ['Cold Email', 'Cold Call'], notes: 'Tested cold phone outreach for 1 hour. Got 1 warm lead.' },
    // Day 9
    { dayOffset: 8, pitches: 15, responses: 3, pos: 2, meet: 2, prop: 1, closed: 0, rev: 0, channels: ['LinkedIn', 'Cold Email'], notes: 'Held 2 discovery calls. Sent 1 enterprise proposal.' },
    // Day 10
    { dayOffset: 9, pitches: 16, responses: 4, pos: 3, meet: 1, prop: 1, closed: 1, rev: 2500, channels: ['Cold Email'], notes: 'CLOSED FIRST CLIENT! $2,500 onboarding for marketing consulting.' },
    // Day 11
    { dayOffset: 10, pitches: 12, responses: 2, pos: 1, meet: 0, prop: 0, closed: 0, rev: 0, channels: ['LinkedIn'], notes: 'Busy onboarding client 1, but still maintained pitch quota.' },
    // Day 12
    { dayOffset: 11, pitches: 15, responses: 5, pos: 3, meet: 2, prop: 1, closed: 0, rev: 0, channels: ['Cold Email', 'Referral'], notes: 'Referral meeting went exceptionally well.' },
    // Day 13 (Saturday - Rest)
    { dayOffset: 12, isRest: true, pitches: 0, responses: 0, pos: 0, meet: 0, prop: 0, closed: 0, rev: 0, channels: [], notes: 'Rest day.' },
    // Day 14 (Sunday - Missed day to test missed indicator)
    // Day 15 (Monday - Week 3)
    { dayOffset: 14, pitches: 18, responses: 6, pos: 4, meet: 2, prop: 1, closed: 0, rev: 0, channels: ['Cold Email', 'LinkedIn'], notes: 'Followed up with 15 past conversations.' },
    // Day 16
    { dayOffset: 15, pitches: 17, responses: 4, pos: 2, meet: 1, prop: 0, closed: 1, rev: 3500, channels: ['Referral'], notes: 'CLOSED CLIENT #2! $3,500 retainership via referral follow-up.' },
    // Day 17
    { dayOffset: 16, pitches: 14, responses: 3, pos: 2, meet: 1, prop: 1, closed: 0, rev: 0, channels: ['Cold Email'], notes: 'Case study angle works best in 2nd follow up email.' },
    // Day 18
    { dayOffset: 17, pitches: 15, responses: 3, pos: 1, meet: 1, prop: 0, closed: 0, rev: 0, channels: ['LinkedIn', 'Freelance Platforms'], notes: 'Tested pitch on marketplace platform.' },
    // Day 19
    { dayOffset: 18, pitches: 20, responses: 5, pos: 3, meet: 2, prop: 1, closed: 0, rev: 0, channels: ['Cold Email', 'Cold Call'], notes: 'Heavy outreach push before weekend.' },
    // Day 20 (Saturday - Rest)
    { dayOffset: 19, isRest: true, pitches: 0, responses: 0, pos: 0, meet: 0, prop: 0, closed: 0, rev: 0, channels: [], notes: 'Planned Week 4 targets.' },
    // Day 21 (Sunday - Rest)
    { dayOffset: 20, isRest: true, pitches: 0, responses: 0, pos: 0, meet: 0, prop: 0, closed: 0, rev: 0, channels: [], notes: 'Rest day.' },
    // Day 22 (Monday - Week 4)
    { dayOffset: 21, pitches: 22, responses: 6, pos: 4, meet: 2, prop: 1, closed: 0, rev: 0, channels: ['Cold Email', 'LinkedIn'], notes: 'High energy Monday! Great traction.' },
    // Day 23 (Tuesday)
    { dayOffset: 22, pitches: 18, responses: 4, pos: 3, meet: 2, prop: 1, closed: 1, rev: 4000, channels: ['LinkedIn', 'Cold Email'], notes: 'CLOSED CLIENT #3! $4,000 project from Day 2 discovery call!' },
    // Day 24 (Today)
    { dayOffset: 23, pitches: 15, responses: 3, pos: 2, meet: 1, prop: 0, closed: 0, rev: 0, channels: ['Cold Email', 'Social / X / IG'], notes: 'Sent initial batch this morning. 2 positive responses waiting for reply.' }
  ];

  sampleLogs.forEach((log, index) => {
    const curDate = addDays(startDateStr, log.dayOffset);
    entries.push({
      id: `entry-${curDate}`,
      date: curDate,
      isRestDay: !!log.isRest,
      pitches: log.pitches,
      responses: log.responses,
      positiveResponses: log.pos,
      meetings: log.meet,
      proposals: log.prop,
      clientsClosed: log.closed,
      revenue: log.rev,
      channels: log.channels || [],
      notes: log.notes,
      followUps: log.closed > 0 ? [
        { id: `fu-${index}-1`, text: 'Send contract & invoice link', completed: true },
        { id: `fu-${index}-2`, text: 'Schedule onboarding strategy call', completed: true }
      ] : (log.meet > 0 ? [
        { id: `fu-${index}-1`, text: 'Send prep agenda & Zoom link', completed: false }
      ] : []),
      createdAt: Date.now() - (24 - index) * 86400000,
      updatedAt: Date.now() - (24 - index) * 86400000
    });
  });

  return entries;
}

/**
 * Load settings from localStorage or fallback
 */
export function loadSettings(): ChallengeSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...getDefaultSettings(),
        ...parsed,
        channels: parsed.channels || DEFAULT_CHANNELS
      };
    }
  } catch (err) {
    console.error('Error loading settings from localStorage:', err);
  }
  return getDefaultSettings();
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: ChallengeSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings to localStorage:', err);
  }
}

/**
 * Load all entries from localStorage, initializing sample data if first visit
 */
export function loadEntries(initialSettings: ChallengeSettings): DailyEntry[] {
  try {
    const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    const stored = localStorage.getItem(STORAGE_KEYS.ENTRIES);

    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    // First time load: initialize with realistic sample data
    if (!isInit) {
      const sample = generateSampleEntries(initialSettings.startDate);
      saveEntries(sample);
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      return sample;
    }
  } catch (err) {
    console.error('Error loading entries from localStorage:', err);
  }
  return [];
}

/**
 * Save all entries to localStorage
 */
export function saveEntries(entries: DailyEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  } catch (err) {
    console.error('Error saving entries to localStorage:', err);
  }
}

/**
 * Clear all data from localStorage
 */
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.ENTRIES);
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

/**
 * Export data to JSON file
 */
export function exportToJson(settings: ChallengeSettings, entries: DailyEntry[]): void {
  const data = {
    appName: '100-Day Client Acquisition Challenge Tracker',
    version: '1.0',
    exportDate: new Date().toISOString(),
    settings,
    entries
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `client-acquisition-100-backup-${formatDate(new Date())}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export entries to CSV file
 */
export function exportToCsv(settings: ChallengeSettings, entries: DailyEntry[]): void {
  const headers = [
    'Date',
    'Day Number',
    'Is Rest Day',
    'Pitches Sent',
    'Responses',
    'Positive Responses',
    'Meetings Booked',
    'Proposals Sent',
    'Clients Closed',
    `Revenue (${settings.currencySymbol})`,
    'Channels',
    'Notes'
  ];

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  const rows = sorted.map(e => {
    const dayNum = diffInDays(settings.startDate, e.date) + 1;
    const channels = `"${(e.channels || []).join(', ')}"`;
    const notes = `"${(e.notes || '').replace(/"/g, '""')}"`;

    return [
      e.date,
      dayNum,
      e.isRestDay ? 'YES' : 'NO',
      e.isRestDay ? 0 : e.pitches || 0,
      e.isRestDay ? 0 : e.responses || 0,
      e.isRestDay ? 0 : e.positiveResponses || 0,
      e.isRestDay ? 0 : e.meetings || 0,
      e.isRestDay ? 0 : e.proposals || 0,
      e.isRestDay ? 0 : e.clientsClosed || 0,
      e.isRestDay ? 0 : e.revenue || 0,
      channels,
      notes
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `100-day-challenge-entries-${formatDate(new Date())}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import and validate JSON backup
 */
export function importFromJson(jsonString: string): { success: boolean; settings?: ChallengeSettings; entries?: DailyEntry[]; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return { success: false, error: 'Invalid JSON format. Expected an object.' };
    }

    if (!Array.isArray(data.entries)) {
      return { success: false, error: 'Invalid data structure: Missing or invalid "entries" array.' };
    }

    // Validate entries
    const validatedEntries: DailyEntry[] = [];
    for (const item of data.entries) {
      if (!item.date || typeof item.date !== 'string') {
        continue;
      }
      validatedEntries.push({
        id: item.id || `entry-${item.date}-${Date.now()}`,
        date: item.date,
        isRestDay: !!item.isRestDay,
        pitches: Number(item.pitches) || 0,
        responses: Number(item.responses) || 0,
        positiveResponses: Number(item.positiveResponses) || 0,
        meetings: Number(item.meetings) || 0,
        proposals: Number(item.proposals) || 0,
        clientsClosed: Number(item.clientsClosed) || 0,
        revenue: Number(item.revenue) || 0,
        channels: Array.isArray(item.channels) ? item.channels : [],
        notes: typeof item.notes === 'string' ? item.notes : '',
        followUps: Array.isArray(item.followUps) ? item.followUps : [],
        createdAt: item.createdAt || Date.now(),
        updatedAt: item.updatedAt || Date.now()
      });
    }

    const settings: ChallengeSettings = data.settings && typeof data.settings === 'object' ? {
      ...getDefaultSettings(),
      ...data.settings
    } : getDefaultSettings();

    return {
      success: true,
      settings,
      entries: validatedEntries
    };
  } catch (err) {
    return { success: false, error: `Failed to parse JSON: ${err instanceof Error ? err.message : 'Unknown error'}` };
  }
}
