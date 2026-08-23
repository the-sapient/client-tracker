import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  DailyEntry, 
  ChallengeSettings, 
  DayInfo, 
  ChallengeMetrics 
} from './types';
import { 
  loadSettings, 
  saveSettings, 
  loadEntries, 
  saveEntries, 
  clearAllData, 
  generateSampleEntries 
} from './utils/storage';
import { 
  formatDate, 
  calculateChallengeMetrics, 
  generate100Days, 
  generateFunnelData, 
  aggregateByChannel, 
  generateWeeklySummaries 
} from './utils/calculations';
import { 
  auth, 
  onAuthStateChanged, 
  User 
} from './firebase';
import { 
  saveUserSettingsToCloud, 
  loadUserSettingsFromCloud, 
  saveEntryToCloud, 
  deleteEntryFromCloud, 
  loadEntriesFromCloud, 
  syncAllToCloud, 
  subscribeToCloudEntries 
} from './services/cloudSync';
import { Navbar } from './components/Navbar';
import { TopStatsCards } from './components/TopStatsCards';
import { ChallengeProgressBanner } from './components/ChallengeProgressBanner';
import { Heatmap100 } from './components/Heatmap100';
import { FunnelAndChannels } from './components/FunnelAndChannels';
import { TrendsCharts } from './components/TrendsCharts';
import { WeeklyBreakdownTable } from './components/WeeklyBreakdownTable';
import { HistoryList } from './components/HistoryList';
import { EntryModal } from './components/EntryModal';
import { DayDetailModal } from './components/DayDetailModal';
import { SettingsModal } from './components/SettingsModal';
import { ChallengeCompleteModal } from './components/ChallengeCompleteModal';

export default function App() {
  const [settings, setSettings] = useState<ChallengeSettings>(() => loadSettings());
  const [entries, setEntries] = useState<DailyEntry[]>(() => loadEntries(settings));
  const [activeTab, setActiveTab] = useState<'dashboard' | 'heatmap' | 'funnel' | 'weekly' | 'history'>('dashboard');

  // Cloud auth & sync states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Modals state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DailyEntry | undefined>(undefined);
  const [entryModalInitialDate, setEntryModalInitialDate] = useState<string | undefined>(undefined);

  const [inspectDay, setInspectDay] = useState<DayInfo | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);

  // Current system date formatted as YYYY-MM-DD
  const todayStr = useMemo(() => formatDate(new Date()), []);

  // 1. Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // When user logs in, pull their cloud data or sync local
        try {
          setIsSyncing(true);
          setSyncError(null);
          const cloudSettings = await loadUserSettingsFromCloud(user.uid);
          const cloudEntries = await loadEntriesFromCloud(user.uid);

          if (cloudSettings || cloudEntries.length > 0) {
            if (cloudSettings) {
              setSettings(cloudSettings);
              saveSettings(cloudSettings);
            }
            if (cloudEntries.length > 0) {
              setEntries(cloudEntries);
              saveEntries(cloudEntries);
            }
          } else {
            // First time user on cloud: push current local state to cloud
            await syncAllToCloud(user.uid, settings, entries);
          }
          setLastSyncedAt(Date.now());
        } catch (err: any) {
          console.error('Initial cloud sync error:', err);
          setSyncError('Could not sync with cloud database.');
        } finally {
          setIsSyncing(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time entries listener when authenticated
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToCloudEntries(
      currentUser.uid,
      (cloudEntries) => {
        if (cloudEntries && cloudEntries.length > 0) {
          setEntries(cloudEntries);
          saveEntries(cloudEntries);
          setLastSyncedAt(Date.now());
        }
      },
      (err) => {
        setSyncError(err.message);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Save entries and settings to localStorage whenever updated
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  // Derived calculations
  const entriesMap = useMemo(() => {
    const map = new Map<string, DailyEntry>();
    entries.forEach(e => map.set(e.date, e));
    return map;
  }, [entries]);

  const all100Days = useMemo(() => {
    return generate100Days(settings, entriesMap, todayStr);
  }, [settings, entriesMap, todayStr]);

  const metrics: ChallengeMetrics = useMemo(() => {
    return calculateChallengeMetrics(settings, entries, todayStr);
  }, [settings, entries, todayStr]);

  const funnelData = useMemo(() => {
    return generateFunnelData(metrics);
  }, [metrics]);

  const channelSummaries = useMemo(() => {
    return aggregateByChannel(entries, settings.channels);
  }, [entries, settings.channels]);

  const weeklySummaries = useMemo(() => {
    return generateWeeklySummaries(settings, entries, todayStr);
  }, [settings, entries, todayStr]);

  const todayEntry = useMemo(() => {
    return entriesMap.get(todayStr);
  }, [entriesMap, todayStr]);

  // Manual trigger for Cloud Sync
  const handleManualSync = useCallback(async () => {
    if (!currentUser) return;
    try {
      setIsSyncing(true);
      setSyncError(null);
      await syncAllToCloud(currentUser.uid, settings, entries);
      setLastSyncedAt(Date.now());
    } catch (err: any) {
      console.error('Manual sync error:', err);
      setSyncError('Sync failed. Please check network connection.');
    } finally {
      setIsSyncing(false);
    }
  }, [currentUser, settings, entries]);

  // Handlers
  const handleOpenLogToday = () => {
    if (todayEntry) {
      setEditingEntry(todayEntry);
      setEntryModalInitialDate(todayStr);
    } else {
      setEditingEntry(undefined);
      setEntryModalInitialDate(todayStr);
    }
    setIsEntryModalOpen(true);
  };

  const handleOpenLogAnyDay = (dateStr?: string) => {
    const targetDate = dateStr || todayStr;
    const existing = entriesMap.get(targetDate);
    setEditingEntry(existing);
    setEntryModalInitialDate(targetDate);
    setIsEntryModalOpen(true);
  };

  const handleSaveEntry = async (savedEntry: DailyEntry) => {
    setEntries(prev => {
      const existingIdx = prev.findIndex(e => e.date === savedEntry.date || e.id === savedEntry.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = savedEntry;
        return copy;
      } else {
        return [...prev, savedEntry];
      }
    });

    // If connected to cloud, sync this document immediately
    if (currentUser) {
      try {
        setIsSyncing(true);
        await saveEntryToCloud(currentUser.uid, savedEntry);
        setLastSyncedAt(Date.now());
      } catch (err: any) {
        console.error('Cloud save entry error:', err);
        setSyncError('Failed to sync entry to cloud.');
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    setEntries(prev => prev.filter(e => e.id !== entryId));

    if (currentUser) {
      try {
        setIsSyncing(true);
        await deleteEntryFromCloud(currentUser.uid, entryId);
        setLastSyncedAt(Date.now());
      } catch (err: any) {
        console.error('Cloud delete entry error:', err);
        setSyncError('Failed to remove entry from cloud.');
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleSaveSettings = async (newSettings: ChallengeSettings) => {
    setSettings(newSettings);

    if (currentUser) {
      try {
        setIsSyncing(true);
        await saveUserSettingsToCloud(currentUser.uid, newSettings);
        setLastSyncedAt(Date.now());
      } catch (err: any) {
        console.error('Cloud save settings error:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleImportData = async (importedSettings: ChallengeSettings, importedEntries: DailyEntry[]) => {
    setSettings(importedSettings);
    setEntries(importedEntries);

    if (currentUser) {
      try {
        setIsSyncing(true);
        await syncAllToCloud(currentUser.uid, importedSettings, importedEntries);
        setLastSyncedAt(Date.now());
      } catch (err: any) {
        console.error('Cloud import error:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleResetData = async () => {
    clearAllData();
    setEntries([]);

    if (currentUser) {
      try {
        setIsSyncing(true);
        // Clear entries in cloud by syncing empty set
        await syncAllToCloud(currentUser.uid, settings, []);
        setLastSyncedAt(Date.now());
      } catch (err: any) {
        console.error('Cloud reset error:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleLoadSampleData = async () => {
    const sample = generateSampleEntries(settings.startDate);
    setEntries(sample);

    if (currentUser) {
      try {
        setIsSyncing(true);
        await syncAllToCloud(currentUser.uid, settings, sample);
        setLastSyncedAt(Date.now());
      } catch (err: any) {
        console.error('Cloud sample load error:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-200 pb-16 selection:bg-emerald-500 selection:text-black">
      
      {/* Top Navigation with Cloud Indicator */}
      <Navbar
        metrics={metrics}
        settings={settings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogToday={handleOpenLogToday}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasTodayEntry={!!todayEntry}
        currentUser={currentUser}
        isSyncing={isSyncing}
        lastSyncedAt={lastSyncedAt}
        syncError={syncError}
        onManualSync={handleManualSync}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Progress & Milestone Banner */}
            <ChallengeProgressBanner
              metrics={metrics}
              settings={settings}
              todayEntry={todayEntry}
              onLogToday={handleOpenLogToday}
              onViewCompleteReport={() => setIsVictoryModalOpen(true)}
            />

            {/* Top KPI Cards */}
            <TopStatsCards
              metrics={metrics}
              settings={settings}
            />

            {/* Trends and Velocity Charts */}
            <TrendsCharts
              entries={entries}
              settings={settings}
              metrics={metrics}
              weeklySummaries={weeklySummaries}
            />

            {/* 100-Day Heatmap Preview Matrix */}
            <Heatmap100
              days={all100Days}
              settings={settings}
              onSelectDay={(day) => setInspectDay(day)}
            />

            {/* Funnel and Channels Grid */}
            <FunnelAndChannels
              metrics={metrics}
              settings={settings}
              funnelData={funnelData}
              channelSummaries={channelSummaries}
            />
          </div>
        )}

        {/* Tab 2: 100-Day Heatmap */}
        {activeTab === 'heatmap' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <ChallengeProgressBanner
              metrics={metrics}
              settings={settings}
              todayEntry={todayEntry}
              onLogToday={handleOpenLogToday}
              onViewCompleteReport={() => setIsVictoryModalOpen(true)}
            />

            <Heatmap100
              days={all100Days}
              settings={settings}
              onSelectDay={(day) => setInspectDay(day)}
            />
          </div>
        )}

        {/* Tab 3: Funnel & Channels */}
        {activeTab === 'funnel' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <TopStatsCards
              metrics={metrics}
              settings={settings}
            />

            <FunnelAndChannels
              metrics={metrics}
              settings={settings}
              funnelData={funnelData}
              channelSummaries={channelSummaries}
            />
          </div>
        )}

        {/* Tab 4: Weekly Breakdown */}
        {activeTab === 'weekly' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <TrendsCharts
              entries={entries}
              settings={settings}
              metrics={metrics}
              weeklySummaries={weeklySummaries}
            />

            <WeeklyBreakdownTable
              weeklySummaries={weeklySummaries}
              settings={settings}
              metrics={metrics}
            />
          </div>
        )}

        {/* Tab 5: Entries History & Logs */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <HistoryList
              entries={entries}
              settings={settings}
              allDays={all100Days}
              onEditEntry={(entry) => {
                setEditingEntry(entry);
                setEntryModalInitialDate(entry.date);
                setIsEntryModalOpen(true);
              }}
              onDeleteEntry={handleDeleteEntry}
              onLogNewDay={() => handleOpenLogAnyDay()}
            />
          </div>
        )}

      </main>

      {/* Modals & Dialogs */}
      <EntryModal
        isOpen={isEntryModalOpen}
        onClose={() => {
          setIsEntryModalOpen(false);
          setEditingEntry(undefined);
          setEntryModalInitialDate(undefined);
        }}
        onSave={handleSaveEntry}
        onDelete={handleDeleteEntry}
        initialDate={entryModalInitialDate}
        existingEntry={editingEntry}
        settings={settings}
      />

      <DayDetailModal
        day={inspectDay}
        settings={settings}
        onClose={() => setInspectDay(null)}
        onEdit={(dateStr) => {
          handleOpenLogAnyDay(dateStr);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        entries={entries}
        onClose={() => setIsSettingsOpen(false)}
        onSaveSettings={handleSaveSettings}
        onImportData={handleImportData}
        onResetData={handleResetData}
        onLoadSampleData={handleLoadSampleData}
      />

      <ChallengeCompleteModal
        isOpen={isVictoryModalOpen}
        onClose={() => setIsVictoryModalOpen(false)}
        metrics={metrics}
        settings={settings}
        entries={entries}
      />

    </div>
  );
}
