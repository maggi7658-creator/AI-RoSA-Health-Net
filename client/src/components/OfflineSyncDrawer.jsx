import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Database, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertCircle, 
  X, 
  HardDrive, 
  Send,
  Trash2
} from 'lucide-react';
import { db, getPendingQueue, markQueueSynced } from '../services/db';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export default function OfflineSyncDrawer({
  isOpen,
  onClose,
  isOffline,
  onSyncCompleted
}) {
  const [queue, setQueue] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [cacheStats, setCacheStats] = useState({ prescriptions: 0, reminders: 0, medicines: 0 });

  useEffect(() => {
    if (isOpen) {
      loadQueueAndStats();
    }
  }, [isOpen]);

  const loadQueueAndStats = async () => {
    const items = await getPendingQueue();
    setQueue(items);

    const rxCount = await db.prescriptions.count();
    const remCount = await db.reminders.count();
    const medCount = await db.cachedMedicines.count();
    setCacheStats({ prescriptions: rxCount, reminders: remCount, medicines: medCount });
  };

  const handleTriggerSync = async () => {
    if (isOffline) {
      alert("Device is currently in offline mode. Please enable online network to sync with the central server.");
      return;
    }

    if (queue.length === 0) return;

    setSyncing(true);
    setSyncResult(null);

    try {
      const res = await api.batchSync(queue);
      
      // Clear synced items from IndexedDB
      for (const item of queue) {
        await markQueueSynced(item.id);
      }

      setSyncResult(res);
      await loadQueueAndStats();
      if (onSyncCompleted) onSyncCompleted();

      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (err) {
      console.error('Sync batch error:', err);
      setSyncResult({ error: 'Sync failed. Server unreachable.' });
    } finally {
      setSyncing(false);
    }
  };

  const handleClearQueue = async () => {
    if (window.confirm("Are you sure you want to clear pending offline actions?")) {
      await db.offlineQueue.clear();
      await loadQueueAndStats();
      if (onSyncCompleted) onSyncCompleted();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-end backdrop-blur-xs">
      <div className="bg-white border-l-4 border-black w-full max-w-md h-full p-6 shadow-[-8px_0px_0px_0px_#000] overflow-y-auto flex flex-col justify-between">
        
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b-3 border-black pb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-brutal-yellow border-2 border-black shadow-brutal-sm">
                <Database size={20} />
              </span>
              <div>
                <h3 className="font-black text-lg uppercase tracking-tight">
                  Offline Sync Manager
                </h3>
                <span className="text-[11px] font-mono font-bold text-gray-600">
                  IndexedDB Engine v1.0
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 border-2 border-black hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Network State Card */}
          <div className={`border-3 border-black p-3.5 shadow-brutal-sm flex items-center justify-between ${
            isOffline ? 'bg-amber-100' : 'bg-brutal-mint'
          }`}>
            <div className="flex items-center gap-2 text-xs font-black uppercase">
              {isOffline ? <WifiOff size={18} /> : <Wifi size={18} />}
              <span>{isOffline ? 'Offline Mode Active' : 'Online & Connected'}</span>
            </div>
            <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 border border-black">
              {queue.length} Queued
            </span>
          </div>

          {/* Local Cache Telemetry */}
          <div className="border-2 border-black p-3 bg-brutal-cream text-xs space-y-2">
            <h4 className="font-black uppercase tracking-wider text-[11px] text-gray-700 flex items-center gap-1.5">
              <HardDrive size={13} />
              <span>Offline Local Storage Footprint</span>
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center font-bold">
              <div className="bg-white p-2 border border-black">
                <span className="text-gray-500 block text-[10px]">Prescriptions</span>
                <span className="font-black text-sm">{cacheStats.prescriptions}</span>
              </div>
              <div className="bg-white p-2 border border-black">
                <span className="text-gray-500 block text-[10px]">Reminders</span>
                <span className="font-black text-sm">{cacheStats.reminders}</span>
              </div>
              <div className="bg-white p-2 border border-black">
                <span className="text-gray-500 block text-[10px]">Meds Cached</span>
                <span className="font-black text-sm">{cacheStats.medicines}</span>
              </div>
            </div>
          </div>

          {/* Sync Success Banner */}
          {syncResult && (
            <div className={`p-3 border-2 border-black text-xs font-bold ${
              syncResult.error ? 'bg-red-100 text-red-900' : 'bg-green-100 text-green-900'
            }`}>
              {syncResult.error ? syncResult.error : (
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={16} />
                  <span>{syncResult.message}</span>
                </div>
              )}
            </div>
          )}

          {/* Pending Queue Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-xs uppercase tracking-wider text-black">
                Pending Actions ({queue.length})
              </h4>
              {queue.length > 0 && (
                <button
                  onClick={handleClearQueue}
                  className="text-[10px] text-red-700 font-bold hover:underline flex items-center gap-1"
                >
                  <Trash2 size={11} /> Clear All
                </button>
              )}
            </div>

            {queue.length === 0 ? (
              <div className="p-6 border-2 border-dashed border-gray-400 text-center text-xs font-semibold text-gray-500">
                All records synchronized with central hospital server. No pending offline items.
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {queue.map((item) => (
                  <div key={item.id} className="p-2.5 border-2 border-black bg-white shadow-brutal-sm text-xs">
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span className="bg-yellow-200 px-1.5 py-0.5 border border-black text-[10px]">
                        {item.type}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {new Date(item.queuedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="font-medium text-black mt-1 truncate">
                      {typeof item.payload === 'object' ? JSON.stringify(item.payload).slice(0, 70) + '...' : item.payload}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sync Action Footer */}
        <div className="pt-4 border-t-3 border-black space-y-2">
          <button
            onClick={handleTriggerSync}
            disabled={syncing || queue.length === 0 || isOffline}
            className={`brutal-btn brutal-btn-yellow w-full py-3 text-sm font-black ${
              syncing || queue.length === 0 || isOffline ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Synchronizing with Cloud...' : 'Synchronize All Offline Items Now'}</span>
          </button>

          {isOffline && (
            <p className="text-[11px] text-center font-bold text-amber-900">
              ⚠️ Switch to Online mode to transmit offline queue to backend.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
