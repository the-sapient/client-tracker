import React, { useState } from 'react';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  LogIn, 
  LogOut, 
  User as UserIcon,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { User } from 'firebase/auth';
import { auth, googleProvider, signInWithPopup, signInAnonymously, signOut } from '../firebase';

interface CloudSyncIndicatorProps {
  user: User | null;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  syncError: string | null;
  onManualSync: () => void;
}

export const CloudSyncIndicator: React.FC<CloudSyncIndicatorProps> = ({
  user,
  isSyncing,
  lastSyncedAt,
  syncError,
  onManualSync
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
      setIsOpen(false);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setAuthError(err?.message || 'Failed to sign in with Google');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      await signInAnonymously(auth);
      setIsOpen(false);
    } catch (err: any) {
      console.error('Anonymous Sign In Error:', err);
      setAuthError(err?.message || 'Failed to enable cloud storage');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setAuthLoading(true);
      await signOut(auth);
      setIsOpen(false);
    } catch (err: any) {
      console.error('Sign Out Error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Not synced yet';
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 5) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative">
      {/* Indicator Button */}
      <button
        id="cloud-sync-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
          user
            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/40'
            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
        }`}
        title="Cloud Sync & Multi-Device Access"
      >
        {isSyncing ? (
          <RefreshCw className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
        ) : user ? (
          <Cloud className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <CloudOff className="h-3.5 w-3.5 text-slate-400" />
        )}

        <span className="hidden sm:inline">
          {isSyncing ? 'Syncing...' : user ? 'Cloud Active' : 'Local Only'}
        </span>

        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#121216] border border-white/10 shadow-2xl p-4 z-50 text-slate-200 space-y-3">
          
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Cloud className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">Cloud Sync Status</h4>
                <p className="text-[10px] text-slate-400">Access from any device in real-time</p>
              </div>
            </div>
          </div>

          {/* Sync status row */}
          <div className="bg-[#16161A] p-3 rounded-xl border border-white/5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 text-[11px]">Database Status:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Firestore Connected
              </span>
            </div>
            
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 text-[11px]">Last Synced:</span>
              <span className="font-medium text-slate-200">{formatLastSync(lastSyncedAt)}</span>
            </div>

            {user && (
              <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-white/5">
                <span className="text-slate-400 text-[11px]">Account:</span>
                <span className="font-medium text-slate-200 truncate max-w-[140px]" title={user.email || 'Anonymous Cloud Session'}>
                  {user.email || 'Cloud Device Linked'}
                </span>
              </div>
            )}
          </div>

          {syncError && (
            <div className="p-2 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-lg text-[11px] flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
              <span>{syncError}</span>
            </div>
          )}

          {authError && (
            <div className="p-2 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-lg text-[11px] flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          {/* User Controls */}
          <div className="space-y-2 pt-1">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onManualSync();
                    setIsOpen(false);
                  }}
                  disabled={isSyncing}
                  className="flex-1 inline-flex items-center justify-center py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  Sync Now
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={authLoading}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                  title="Sign out of cloud sync"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-50 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <LogIn className="h-3.5 w-3.5 mr-1.5 stroke-[2.5]" />
                  Sign In with Google to Sync
                </button>
                <button
                  type="button"
                  onClick={handleAnonymousSignIn}
                  disabled={authLoading}
                  className="w-full inline-flex items-center justify-center py-1.5 rounded-xl text-[11px] font-semibold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                >
                  Enable Instant Device Sync (No Login)
                </button>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 text-center pt-1">
            Data is backed up on Google Cloud Firestore
          </div>

        </div>
      )}
    </div>
  );
};
