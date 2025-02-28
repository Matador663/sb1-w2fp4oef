import { useState, useEffect, useCallback } from 'react';
import SyncService, { SyncableDataType } from '../services/SyncService';

// Custom hook for syncing data
function useSync<T>(dataType: SyncableDataType): [T[], (data: T[]) => void, boolean] {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const syncService = SyncService.getInstance();
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const initialData = await syncService.getData<T>(dataType);
        setData(initialData);
      } catch (error) {
        console.error(`Error loading ${dataType}:`, error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [dataType]);
  
  // Function to save and sync data
  const saveData = useCallback(async (newData: T[]) => {
    setData(newData);
    await syncService.saveData(dataType, newData);
  }, [dataType, syncService]);
  
  return [data, saveData, loading];
}

export default useSync;