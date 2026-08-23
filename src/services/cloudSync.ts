import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  writeBatch,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { ChallengeSettings, DailyEntry } from '../types';
import { getDefaultSettings } from '../utils/storage';

export interface CloudSyncState {
  isCloudConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  syncError: string | null;
}

/**
 * Save user settings to Firestore under /users/{uid}/settings/challenge
 */
export async function saveUserSettingsToCloud(userId: string, settings: ChallengeSettings): Promise<void> {
  try {
    const settingsRef = doc(db, 'users', userId, 'settings', 'challenge');
    await setDoc(settingsRef, {
      userId,
      ...settings,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving settings to cloud:', error);
    throw error;
  }
}

/**
 * Load user settings from Firestore
 */
export async function loadUserSettingsFromCloud(userId: string): Promise<ChallengeSettings | null> {
  try {
    const settingsRef = doc(db, 'users', userId, 'settings', 'challenge');
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        startDate: data.startDate,
        currencySymbol: data.currencySymbol || '$',
        currencyCode: data.currencyCode || 'USD',
        targetClients: Number(data.targetClients) || 12,
        targetRevenue: Number(data.targetRevenue) || 30000,
        targetDailyPitches: Number(data.targetDailyPitches) || 15,
        channels: data.channels || []
      };
    }
    return null;
  } catch (error) {
    console.error('Error loading settings from cloud:', error);
    return null;
  }
}

/**
 * Save single entry to Firestore under /users/{uid}/entries/{entryId}
 */
export async function saveEntryToCloud(userId: string, entry: DailyEntry): Promise<void> {
  try {
    const entryRef = doc(db, 'users', userId, 'entries', entry.id || `entry-${entry.date}`);
    await setDoc(entryRef, {
      ...entry,
      id: entry.id || `entry-${entry.date}`,
      userId,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving entry to cloud:', error);
    throw error;
  }
}

/**
 * Delete single entry from Firestore
 */
export async function deleteEntryFromCloud(userId: string, entryId: string): Promise<void> {
  try {
    const entryRef = doc(db, 'users', userId, 'entries', entryId);
    await deleteDoc(entryRef);
  } catch (error) {
    console.error('Error deleting entry from cloud:', error);
    throw error;
  }
}

/**
 * Bulk upload local entries & settings to Firestore
 */
export async function syncAllToCloud(userId: string, settings: ChallengeSettings, entries: DailyEntry[]): Promise<void> {
  try {
    // 1. Save settings
    await saveUserSettingsToCloud(userId, settings);

    // 2. Batch save entries in chunks of 450 (Firestore limit is 500 operations per batch)
    const chunkSize = 400;
    for (let i = 0; i < entries.length; i += chunkSize) {
      const chunk = entries.slice(i, i + chunkSize);
      const batch = writeBatch(db);

      chunk.forEach(entry => {
        const docId = entry.id || `entry-${entry.date}`;
        const ref = doc(db, 'users', userId, 'entries', docId);
        batch.set(ref, {
          ...entry,
          id: docId,
          userId,
          updatedAt: Date.now()
        }, { merge: true });
      });

      await batch.commit();
    }
  } catch (error) {
    console.error('Error in syncAllToCloud:', error);
    throw error;
  }
}

/**
 * Fetch all entries for a user from Firestore
 */
export async function loadEntriesFromCloud(userId: string): Promise<DailyEntry[]> {
  try {
    const entriesRef = collection(db, 'users', userId, 'entries');
    const snap = await getDocs(entriesRef);
    const result: DailyEntry[] = [];
    snap.forEach(docSnap => {
      const data = docSnap.data();
      result.push({
        id: docSnap.id,
        date: data.date,
        pitches: Number(data.pitches) || 0,
        responses: Number(data.responses) || 0,
        positiveResponses: Number(data.positiveResponses) || 0,
        meetings: Number(data.meetings) || 0,
        proposals: Number(data.proposals) || 0,
        clientsClosed: Number(data.clientsClosed) || 0,
        revenue: Number(data.revenue) || 0,
        channels: data.channels || [],
        notes: data.notes || '',
        isRestDay: !!data.isRestDay,
        followUps: data.followUps || [],
        createdAt: data.createdAt || Date.now(),
        updatedAt: data.updatedAt || Date.now()
      });
    });
    return result;
  } catch (error) {
    console.error('Error fetching cloud entries:', error);
    return [];
  }
}

/**
 * Subscribe to real-time entries changes from Firestore
 */
export function subscribeToCloudEntries(
  userId: string, 
  onUpdate: (entries: DailyEntry[]) => void,
  onError?: (err: Error) => void
) {
  const entriesRef = collection(db, 'users', userId, 'entries');
  return onSnapshot(entriesRef, (snap) => {
    const entries: DailyEntry[] = [];
    snap.forEach(docSnap => {
      const data = docSnap.data();
      entries.push({
        id: docSnap.id,
        date: data.date,
        pitches: Number(data.pitches) || 0,
        responses: Number(data.responses) || 0,
        positiveResponses: Number(data.positiveResponses) || 0,
        meetings: Number(data.meetings) || 0,
        proposals: Number(data.proposals) || 0,
        clientsClosed: Number(data.clientsClosed) || 0,
        revenue: Number(data.revenue) || 0,
        channels: data.channels || [],
        notes: data.notes || '',
        isRestDay: !!data.isRestDay,
        followUps: data.followUps || [],
        createdAt: data.createdAt || Date.now(),
        updatedAt: data.updatedAt || Date.now()
      });
    });
    onUpdate(entries);
  }, (err) => {
    console.error('Firestore entries subscription error:', err);
    if (onError) onError(err);
  });
}
