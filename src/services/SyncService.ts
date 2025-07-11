// Define the types of data we'll be syncing
export type SyncableDataType = 'influencers' | 'collaborations';

// Interface for sync events
interface SyncEvent {
  type: SyncableDataType;
  data: any[];
  timestamp: number;
}

// Main SyncService class
class SyncService {
  private static instance: SyncService;
  private syncInterval: number = 30000; // 30 seconds
  private intervalId: NodeJS.Timeout | null = null;
  private lastSyncTimestamp: Record<SyncableDataType, number> = {
    influencers: 0,
    collaborations: 0
  };

  // Singleton pattern
  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  // Initialize the sync service
  public async init(): Promise<void> {
    // Load initial data from localStorage
    await this.loadInitialData();
    
    // Start periodic sync
    this.startPeriodicSync();
    
    console.log('SyncService initialized');
  }

  // Load initial data from localStorage or set defaults
  private async loadInitialData(): Promise<void> {
    try {
      // Check if influencers exist in localStorage
      const influencers = localStorage.getItem('influencers');
      if (!influencers) {
        await this.initializeInfluencers();
      }
      
      // Check if collaborations exist in localStorage
      const collaborations = localStorage.getItem('collaborations');
      if (!collaborations) {
        await this.initializeCollaborations();
      }
      
      // Initialize sync metadata
      const syncMetadata = localStorage.getItem('syncMetadata');
      if (!syncMetadata) {
        localStorage.setItem('syncMetadata', JSON.stringify({
          lastSync: Date.now(),
          deviceId: this.generateDeviceId()
        }));
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }

  // Generate a unique device ID
  private generateDeviceId(): string {
    return 'device_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Initialize influencers with mock data if needed
  private async initializeInfluencers(): Promise<void> {
    const mockInfluencers = [
      {
        id: '1',
        name: 'Ayşe Yılmaz',
        brand: 'Nike',
        fee: 5000,
        status: 'Tamamlandı',
        collaboration_count: 12,
        category: 'Spor',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
        phone: '+90 555 123 4567',
        email: 'ayse.yilmaz@example.com',
        instagram: 'ayseyilmaz',
        tiktok: 'ayseyilmaz'
      },
      {
        id: '2',
        name: 'Mehmet Demir',
        brand: 'Adidas',
        fee: 3500,
        status: 'Onaylandı',
        collaboration_count: 8,
        category: 'Moda',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
        phone: '+90 555 234 5678',
        email: 'mehmet.demir@example.com',
        instagram: 'mehmetdemir',
        tiktok: 'mehmetdemir'
      },
      {
        id: '3',
        name: 'Zeynep Kaya',
        brand: 'Puma',
        fee: 2800,
        status: 'Beklemede',
        collaboration_count: 5,
        category: 'Dans',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
        phone: '+90 555 345 6789',
        email: 'zeynep.kaya@example.com',
        instagram: 'zeynepkaya',
        tiktok: 'zeynepkaya'
      }
    ];
    
    localStorage.setItem('influencers', JSON.stringify(mockInfluencers));
    this.dispatchSyncEvent('influencers', mockInfluencers);
  }

  // Initialize collaborations with mock data if needed
  private async initializeCollaborations(): Promise<void> {
    const mockCollaborations = [
      { id: '1', brand: 'Nike', date: '2023-05-15', fee: 5000, collaboration_count: 2, assigned_to: 'ÖNCÜ EVRENSEL', status: 'Tamamlandı', influencer_id: '1', influencer_name: 'Ayşe Yılmaz' },
      { id: '2', brand: 'Adidas', date: '2023-07-22', fee: 4500, collaboration_count: 3, assigned_to: 'CAN AYDIN', status: 'Tamamlandı', influencer_id: '1', influencer_name: 'Ayşe Yılmaz' },
      { id: '3', brand: 'Puma', date: '2023-09-10', fee: 3800, collaboration_count: 1, assigned_to: 'İBRAHİM HALİL BOZDAĞ', status: 'Tamamlandı', influencer_id: '1', influencer_name: 'Ayşe Yılmaz' }
    ];
    
    localStorage.setItem('collaborations', JSON.stringify(mockCollaborations));
    this.dispatchSyncEvent('collaborations', mockCollaborations);
  }

  // Start periodic sync
  private startPeriodicSync(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.intervalId = setInterval(() => {
      this.syncAllData();
    }, this.syncInterval);
  }

  // Sync all data types
  private async syncAllData(): Promise<void> {
    await this.syncData('influencers');
    await this.syncData('collaborations');
    
    try {
      // Update sync metadata
      const metadataStr = localStorage.getItem('syncMetadata');
      const metadata = metadataStr ? JSON.parse(metadataStr) : {};
      metadata.lastSync = Date.now();
      localStorage.setItem('syncMetadata', JSON.stringify(metadata));
    } catch (error) {
      console.error('Error updating sync metadata:', error);
    }
  }

  // Sync specific data type
  private async syncData(type: SyncableDataType): Promise<void> {
    try {
      const dataStr = localStorage.getItem(type);
      const data = dataStr ? JSON.parse(dataStr) : [];
      this.dispatchSyncEvent(type, data);
    } catch (error) {
      console.error(`Error syncing ${type}:`, error);
    }
  }

  // Dispatch sync event
  private dispatchSyncEvent(type: SyncableDataType, data: any[]): void {
    const event: SyncEvent = {
      type,
      data,
      timestamp: Date.now()
    };
    
    // Update localStorage
    localStorage.setItem(type, JSON.stringify(data));
    
    // Update last sync timestamp
    this.lastSyncTimestamp[type] = event.timestamp;
    
    // Dispatch custom event
    const customEvent = new CustomEvent(`${type}Updated`, { detail: data });
    window.dispatchEvent(customEvent);
  }

  // Save data and trigger sync
  public async saveData(type: SyncableDataType, data: any[]): Promise<void> {
    try {
      localStorage.setItem(type, JSON.stringify(data));
      this.dispatchSyncEvent(type, data);
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
    }
  }

  // Get data with automatic sync
  public async getData<T>(type: SyncableDataType): Promise<T[]> {
    try {
      const dataStr = localStorage.getItem(type);
      return dataStr ? JSON.parse(dataStr) as T[] : [];
    } catch (error) {
      console.error(`Error getting ${type}:`, error);
      return [];
    }
  }

  // Clean up resources
  public destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export default SyncService;