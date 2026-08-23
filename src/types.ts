export interface FollowUpItem {
  id: string;
  text: string;
  dueDate?: string;
  completed: boolean;
}

export interface DailyEntry {
  id: string;
  date: string; // YYYY-MM-DD
  isRestDay: boolean;
  pitches: number;
  responses: number;
  positiveResponses: number;
  meetings: number;
  proposals: number;
  clientsClosed: number;
  revenue: number;
  channels: string[];
  notes: string;
  followUps?: FollowUpItem[];
  createdAt: number;
  updatedAt: number;
}

export interface ChannelConfig {
  id: string;
  name: string;
  color: string;
}

export interface ChallengeSettings {
  startDate: string; // YYYY-MM-DD
  currencySymbol: string; // e.g. "$", "€", "£", "₦"
  currencyCode: string; // e.g. "USD", "EUR"
  targetClients: number; // e.g. 10
  targetRevenue: number; // e.g. 25000
  targetDailyPitches: number; // e.g. 15
  channels: ChannelConfig[];
}

export type DayStatus = 'active' | 'rest' | 'missed' | 'future' | 'today';

export interface DayInfo {
  dayNumber: number; // 1 to 100
  dateStr: string; // YYYY-MM-DD
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  status: DayStatus;
  entry?: DailyEntry;
}

export interface ChallengeMetrics {
  currentDayNumber: number;
  daysRemaining: number;
  progressPercent: number;
  isComplete: boolean;
  isNotStarted: boolean;
  daysUntilStart: number;
  endDate: string;
  totalPitches: number;
  totalResponses: number;
  totalPositiveResponses: number;
  totalMeetings: number;
  totalProposals: number;
  totalClients: number;
  totalRevenue: number;
  responseRate: number; // % (responses / pitches * 100)
  positiveResponseRate: number; // % (positive / responses * 100)
  meetingRate: number; // % (meetings / responses * 100)
  closeRate: number; // % (clients / proposals * 100)
  overallConversionRate: number; // % (clients / pitches * 100)
  avgRevenuePerClient: number;
  avgPitchesPerClient: number;
  activeDaysCount: number;
  restDaysCount: number;
  missedDaysCount: number;
  futureDaysCount: number;
  currentStreak: number;
  bestStreak: number;
  dailyAvgPitches: number; // totalPitches / activeDaysCount
  projectedPitches: number;
  projectedClients: number;
  projectedRevenue: number;
  pitchPaceStatus: 'ahead' | 'on_track' | 'behind';
  revenuePaceStatus: 'ahead' | 'on_track' | 'behind';
  clientPaceStatus: 'ahead' | 'on_track' | 'behind';
}

export interface ChannelSummary {
  channel: string;
  color: string;
  pitches: number;
  responses: number;
  positiveResponses: number;
  meetings: number;
  proposals: number;
  clients: number;
  revenue: number;
  responseRate: number;
}

export interface WeeklySummary {
  weekNumber: number;
  startDate: string;
  endDate: string;
  dayStartNumber: number;
  dayEndNumber: number;
  pitches: number;
  responses: number;
  positiveResponses: number;
  meetings: number;
  proposals: number;
  clients: number;
  revenue: number;
  responseRate: number;
  activeDays: number;
  restDays: number;
  missedDays: number;
}

export interface FunnelStage {
  name: string;
  count: number;
  conversionFromPrev: number; // %
  conversionFromTop: number; // %
  dropOff: number;
  color: string;
}
