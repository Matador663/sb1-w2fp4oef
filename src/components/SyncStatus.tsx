import React, { useState, useEffect } from 'react';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';

const SyncStatus: React.FC = () => {
  const [syncState, setSyncState] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  
  useEffect(() => {
    // Get initial sync status
    const syncMetadata = localStorage.getItem('syncMetadata');
    if (syncMetadata) {
      const metadata = JSON.parse(syncMetadata);
      setLastSync(new Date(metadata.lastSync));
    }
    
    // Listen for sync events
    const handleSync = () => {
      setSyncState('syncing');
      setTimeout(() => {
        setSyncState('synced');
        const metadata = JSON.parse(localStorage.getItem('syncMetadata') || '{}');
        setLastSync(new Date(metadata.lastSync));
      }, 1000);
    };
    
    // Listen for storage events
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'syncMetadata' && event.newValue) {
        const metadata = JSON.parse(event.newValue);
        setLastSync(new Date(metadata.lastSync));
        setSyncState('synced');
      }
    };
    
    window.addEventListener('influencersUpdated', handleSync);
    window.addEventListener('collaborationsUpdated', handleSync);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('influencersUpdated', handleSync);
      window.removeEventListener('collaborationsUpdated', handleSync);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const formatLastSync = () => {
    if (!lastSync) return 'Henüz senkronize edilmedi';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    
    if (diffSec < 60) {
      return 'Az önce';
    } else if (diffMin < 60) {
      return `${diffMin} dakika önce`;
    } else if (diffHour < 24) {
      return `${diffHour} saat önce`;
    } else {
      return lastSync.toLocaleDateString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-md p-3 flex items-center space-x-2 text-sm">
      {syncState === 'syncing' && (
        <RefreshCw size={16} className="text-blue-500 animate-spin" />
      )}
      {syncState === 'synced' && (
        <Check size={16} className="text-green-500" />
      )}
      {syncState === 'error' && (
        <AlertCircle size={16} className="text-red-500" />
      )}
      <span className="text-gray-600">
        {syncState === 'syncing' ? 'Senkronize ediliyor...' : 
         syncState === 'error' ? 'Senkronizasyon hatası!' : 
         `Son senkronizasyon: ${formatLastSync()}`}
      </span>
    </div>
  );
};

export default SyncStatus;