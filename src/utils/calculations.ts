import { ChallengeSettings, DailyEntry, ChallengeMetrics, DayInfo, DayStatus, ChannelSummary, WeeklySummary, FunnelStage } from '../types';

/**
 * Format a Date object to YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse YYYY-MM-DD into a Date object at local midnight
 */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/**
 * Add days to a date string and return YYYY-MM-DD
 */
export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

/**
 * Calculate difference in calendar days between two YYYY-MM-DD strings (date2 - date1)
 */
export function diffInDays(dateStr1: string, dateStr2: string): number {
  const d1 = parseDate(dateStr1);
  const d2 = parseDate(dateStr2);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Pretty format date (e.g. "Aug 23, 2026")
 */
export function formatPrettyDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = parseDate(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format currency with symbol
 */
export function formatCurrency(amount: number, symbol: string = '$'): string {
  if (isNaN(amount) || amount === 0) return `${symbol}0`;
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: amount % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Format percentage with 1 decimal
 */
export function formatPercent(value: number): string {
  if (isNaN(value) || !isFinite(value)) return '0.0%';
  return `${value.toFixed(1)}%`;
}

/**
 * Build the array of 100 days based on Start Date and entries map
 */
export function generate100Days(settings: ChallengeSettings, entriesMap: Map<string, DailyEntry>, todayStr: string): DayInfo[] {
  const days: DayInfo[] = [];
  const startDateStr = settings.startDate;

  for (let i = 0; i < 100; i++) {
    const dateStr = addDays(startDateStr, i);
    const dayNumber = i + 1;
    const isToday = dateStr === todayStr;
    const dayDiffFromToday = diffInDays(todayStr, dateStr); // positive if in future
    const isPast = dayDiffFromToday < 0;
    const isFuture = dayDiffFromToday > 0;
    const entry = entriesMap.get(dateStr);

    let status: DayStatus = 'future';

    if (entry) {
      if (entry.isRestDay) {
        status = 'rest';
      } else if (entry.pitches > 0 || entry.responses > 0 || entry.clientsClosed > 0) {
        status = 'active';
      } else {
        // logged with 0 pitches
        status = isPast ? 'missed' : 'active';
      }
    } else {
      if (isToday) {
        status = 'today';
      } else if (isPast) {
        status = 'missed';
      } else {
        status = 'future';
      }
    }

    days.push({
      dayNumber,
      dateStr,
      isToday,
      isPast,
      isFuture,
      status,
      entry
    });
  }

  return days;
}

/**
 * Calculate all challenge metrics from entries and settings
 */
export function calculateChallengeMetrics(
  settings: ChallengeSettings,
  entries: DailyEntry[],
  todayStr: string
): ChallengeMetrics {
  const entriesMap = new Map<string, DailyEntry>();
  entries.forEach(e => entriesMap.set(e.date, e));

  const startDateStr = settings.startDate;
  const endDateStr = addDays(startDateStr, 99);
  
  const diffFromStart = diffInDays(startDateStr, todayStr);
  const isNotStarted = diffFromStart < 0;
  const daysUntilStart = isNotStarted ? Math.abs(diffFromStart) : 0;
  
  let currentDayNumber = 0;
  let isComplete = false;

  if (isNotStarted) {
    currentDayNumber = 0;
  } else if (diffFromStart >= 100) {
    currentDayNumber = 100;
    isComplete = true;
  } else {
    currentDayNumber = diffFromStart + 1;
  }

  const daysRemaining = Math.max(0, 100 - currentDayNumber);
  const progressPercent = Math.min(100, Math.max(0, (currentDayNumber / 100) * 100));

  // Totals
  let totalPitches = 0;
  let totalResponses = 0;
  let totalPositiveResponses = 0;
  let totalMeetings = 0;
  let totalProposals = 0;
  let totalClients = 0;
  let totalRevenue = 0;

  let activeDaysCount = 0;
  let restDaysCount = 0;

  entries.forEach(e => {
    if (e.isRestDay) {
      restDaysCount++;
    } else {
      if (e.pitches > 0 || e.responses > 0 || e.clientsClosed > 0) {
        activeDaysCount++;
      }
      totalPitches += e.pitches || 0;
      totalResponses += e.responses || 0;
      totalPositiveResponses += e.positiveResponses || 0;
      totalMeetings += e.meetings || 0;
      totalProposals += e.proposals || 0;
      totalClients += e.clientsClosed || 0;
      totalRevenue += e.revenue || 0;
    }
  });

  const all100Days = generate100Days(settings, entriesMap, todayStr);
  const missedDaysCount = all100Days.filter(d => d.status === 'missed').length;
  const futureDaysCount = all100Days.filter(d => d.status === 'future').length;

  // Conversion Rates
  const responseRate = totalPitches > 0 ? (totalResponses / totalPitches) * 100 : 0;
  const positiveResponseRate = totalResponses > 0 ? (totalPositiveResponses / totalResponses) * 100 : 0;
  const meetingRate = totalResponses > 0 ? (totalMeetings / totalResponses) * 100 : 0;
  const closeRate = totalProposals > 0 ? (totalClients / totalProposals) * 100 : 0;
  const overallConversionRate = totalPitches > 0 ? (totalClients / totalPitches) * 100 : 0;

  const avgRevenuePerClient = totalClients > 0 ? totalRevenue / totalClients : 0;
  const avgPitchesPerClient = totalClients > 0 ? totalPitches / totalClients : totalPitches;

  const dailyAvgPitches = activeDaysCount > 0 ? totalPitches / activeDaysCount : 0;

  // Streak Calculation
  // Sort days chronologically up to today
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  const daysUpToNow = all100Days.filter(d => d.dayNumber <= (currentDayNumber === 0 ? 1 : currentDayNumber));
  
  // Calculate streaks across chronological sequence
  for (let i = 0; i < daysUpToNow.length; i++) {
    const day = daysUpToNow[i];
    if (day.status === 'active') {
      tempStreak++;
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    } else if (day.status === 'rest') {
      // Rest day is neutral - doesn't increment, but also doesn't break consecutive habit if surrounded by active
      // For strict active streak, we can either keep or freeze. Let's keep streak alive without incrementing.
    } else if (day.status === 'missed') {
      tempStreak = 0;
    }
  }

  // Calculate current active streak ending at today or yesterday
  let backwardStreak = 0;
  for (let i = daysUpToNow.length - 1; i >= 0; i--) {
    const day = daysUpToNow[i];
    if (day.status === 'active') {
      backwardStreak++;
    } else if (day.status === 'rest') {
      // pass through
      continue;
    } else if (day.status === 'today' && !day.entry) {
      // Today hasn't been logged yet, check yesterday
      continue;
    } else {
      break;
    }
  }
  currentStreak = backwardStreak;

  // Projections
  // Days elapsed active or calendar days elapsed (minimum 1 to avoid / 0)
  const daysElapsed = Math.max(1, currentDayNumber);
  const remainingDays = 100 - currentDayNumber;

  const dailyPitchesRate = totalPitches / daysElapsed;
  const projectedPitches = Math.round(totalPitches + (dailyPitchesRate * remainingDays));

  const dailyClientsRate = totalClients / daysElapsed;
  const projectedClients = Math.max(totalClients, Math.round(totalClients + (dailyClientsRate * remainingDays)));

  const dailyRevenueRate = totalRevenue / daysElapsed;
  const projectedRevenue = Math.max(totalRevenue, Math.round(totalRevenue + (dailyRevenueRate * remainingDays)));

  // Target comparison pace
  const expectedPitchesByNow = settings.targetDailyPitches * daysElapsed;
  const pitchPaceStatus = totalPitches >= expectedPitchesByNow * 0.95 
    ? (totalPitches >= expectedPitchesByNow * 1.1 ? 'ahead' : 'on_track') 
    : 'behind';

  const expectedRevenueByNow = (settings.targetRevenue / 100) * daysElapsed;
  const revenuePaceStatus = totalRevenue >= expectedRevenueByNow * 0.9 
    ? (totalRevenue >= expectedRevenueByNow * 1.1 ? 'ahead' : 'on_track') 
    : 'behind';

  const expectedClientsByNow = (settings.targetClients / 100) * daysElapsed;
  const clientPaceStatus = totalClients >= expectedClientsByNow * 0.9 
    ? (totalClients >= expectedClientsByNow * 1.1 ? 'ahead' : 'on_track') 
    : 'behind';

  return {
    currentDayNumber,
    daysRemaining,
    progressPercent,
    isComplete,
    isNotStarted,
    daysUntilStart,
    endDate: endDateStr,
    totalPitches,
    totalResponses,
    totalPositiveResponses,
    totalMeetings,
    totalProposals,
    totalClients,
    totalRevenue,
    responseRate,
    positiveResponseRate,
    meetingRate,
    closeRate,
    overallConversionRate,
    avgRevenuePerClient,
    avgPitchesPerClient,
    activeDaysCount,
    restDaysCount,
    missedDaysCount,
    futureDaysCount,
    currentStreak,
    bestStreak,
    dailyAvgPitches,
    projectedPitches,
    projectedClients,
    projectedRevenue,
    pitchPaceStatus,
    revenuePaceStatus,
    clientPaceStatus
  };
}

/**
 * Generate Funnel Stages data for visual conversion visualization
 */
export function generateFunnelData(metrics: ChallengeMetrics): FunnelStage[] {
  const { totalPitches, totalResponses, totalPositiveResponses, totalMeetings, totalProposals, totalClients } = metrics;

  const stages = [
    {
      name: 'Pitches Sent',
      count: totalPitches,
      conversionFromPrev: 100,
      conversionFromTop: 100,
      dropOff: 0,
      color: '#4f46e5' // indigo
    },
    {
      name: 'Responses Received',
      count: totalResponses,
      conversionFromPrev: totalPitches > 0 ? (totalResponses / totalPitches) * 100 : 0,
      conversionFromTop: totalPitches > 0 ? (totalResponses / totalPitches) * 100 : 0,
      dropOff: Math.max(0, totalPitches - totalResponses),
      color: '#0ea5e9' // sky
    },
    {
      name: 'Positive / Interested',
      count: totalPositiveResponses,
      conversionFromPrev: totalResponses > 0 ? (totalPositiveResponses / totalResponses) * 100 : 0,
      conversionFromTop: totalPitches > 0 ? (totalPositiveResponses / totalPitches) * 100 : 0,
      dropOff: Math.max(0, totalResponses - totalPositiveResponses),
      color: '#06b6d4' // cyan
    },
    {
      name: 'Meetings Booked',
      count: totalMeetings,
      conversionFromPrev: totalPositiveResponses > 0 ? (totalMeetings / totalPositiveResponses) * 100 : (totalResponses > 0 ? (totalMeetings / totalResponses) * 100 : 0),
      conversionFromTop: totalPitches > 0 ? (totalMeetings / totalPitches) * 100 : 0,
      dropOff: Math.max(0, (totalPositiveResponses || totalResponses) - totalMeetings),
      color: '#10b981' // emerald
    },
    {
      name: 'Proposals Sent',
      count: totalProposals,
      conversionFromPrev: totalMeetings > 0 ? (totalProposals / totalMeetings) * 100 : 0,
      conversionFromTop: totalPitches > 0 ? (totalProposals / totalPitches) * 100 : 0,
      dropOff: Math.max(0, totalMeetings - totalProposals),
      color: '#f59e0b' // amber
    },
    {
      name: 'Clients Closed',
      count: totalClients,
      conversionFromPrev: totalProposals > 0 ? (totalClients / totalProposals) * 100 : 0,
      conversionFromTop: totalPitches > 0 ? (totalClients / totalPitches) * 100 : 0,
      dropOff: Math.max(0, totalProposals - totalClients),
      color: '#16a34a' // green
    }
  ];

  return stages;
}

/**
 * Aggregate metrics by channel
 */
export function aggregateByChannel(
  entries: DailyEntry[],
  channelsConfig: { id: string; name: string; color: string }[]
): ChannelSummary[] {
  const channelMap = new Map<string, ChannelSummary>();

  // Initialize with configured channels
  channelsConfig.forEach(c => {
    channelMap.set(c.name, {
      channel: c.name,
      color: c.color || '#6366f1',
      pitches: 0,
      responses: 0,
      positiveResponses: 0,
      meetings: 0,
      proposals: 0,
      clients: 0,
      revenue: 0,
      responseRate: 0
    });
  });

  // Aggregate
  entries.forEach(e => {
    if (e.isRestDay) return;
    const channels = e.channels && e.channels.length > 0 ? e.channels : ['Other'];
    const channelCount = channels.length;

    channels.forEach(ch => {
      let stats = channelMap.get(ch);
      if (!stats) {
        stats = {
          channel: ch,
          color: '#64748b',
          pitches: 0,
          responses: 0,
          positiveResponses: 0,
          meetings: 0,
          proposals: 0,
          clients: 0,
          revenue: 0,
          responseRate: 0
        };
        channelMap.set(ch, stats);
      }

      // Distribute evenly if multiple channels were used that day
      stats.pitches += Math.round((e.pitches || 0) / channelCount);
      stats.responses += Math.round((e.responses || 0) / channelCount);
      stats.positiveResponses += Math.round((e.positiveResponses || 0) / channelCount);
      stats.meetings += Math.round((e.meetings || 0) / channelCount);
      stats.proposals += Math.round((e.proposals || 0) / channelCount);
      stats.clients += Math.round((e.clientsClosed || 0) / channelCount);
      stats.revenue += Math.round((e.revenue || 0) / channelCount);
    });
  });

  const summaries = Array.from(channelMap.values());
  summaries.forEach(s => {
    s.responseRate = s.pitches > 0 ? (s.responses / s.pitches) * 100 : 0;
  });

  return summaries.sort((a, b) => b.pitches - a.pitches);
}

/**
 * Group days into 14-15 weekly summaries
 */
export function generateWeeklySummaries(
  settings: ChallengeSettings,
  entries: DailyEntry[],
  todayStr: string
): WeeklySummary[] {
  const entriesMap = new Map<string, DailyEntry>();
  entries.forEach(e => entriesMap.set(e.date, e));

  const all100Days = generate100Days(settings, entriesMap, todayStr);
  const weeks: WeeklySummary[] = [];

  const totalWeeks = Math.ceil(100 / 7); // 15 weeks

  for (let w = 0; w < totalWeeks; w++) {
    const weekNumber = w + 1;
    const startIdx = w * 7;
    const endIdx = Math.min(100, (w + 1) * 7);
    const weekDays = all100Days.slice(startIdx, endIdx);

    if (weekDays.length === 0) continue;

    const startDate = weekDays[0].dateStr;
    const endDate = weekDays[weekDays.length - 1].dateStr;
    const dayStartNumber = weekDays[0].dayNumber;
    const dayEndNumber = weekDays[weekDays.length - 1].dayNumber;

    let pitches = 0;
    let responses = 0;
    let positiveResponses = 0;
    let meetings = 0;
    let proposals = 0;
    let clients = 0;
    let revenue = 0;
    let activeDays = 0;
    let restDays = 0;
    let missedDays = 0;

    weekDays.forEach(d => {
      if (d.status === 'active') activeDays++;
      if (d.status === 'rest') restDays++;
      if (d.status === 'missed') missedDays++;

      if (d.entry && !d.entry.isRestDay) {
        pitches += d.entry.pitches || 0;
        responses += d.entry.responses || 0;
        positiveResponses += d.entry.positiveResponses || 0;
        meetings += d.entry.meetings || 0;
        proposals += d.entry.proposals || 0;
        clients += d.entry.clientsClosed || 0;
        revenue += d.entry.revenue || 0;
      }
    });

    const responseRate = pitches > 0 ? (responses / pitches) * 100 : 0;

    weeks.push({
      weekNumber,
      startDate,
      endDate,
      dayStartNumber,
      dayEndNumber,
      pitches,
      responses,
      positiveResponses,
      meetings,
      proposals,
      clients,
      revenue,
      responseRate,
      activeDays,
      restDays,
      missedDays
    });
  }

  return weeks;
}
