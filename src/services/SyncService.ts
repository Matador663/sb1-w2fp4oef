import AsyncStorage from '@react-native-async-storage/async-storage';
import { Influencer, Collaboration } from '../types';

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
    // Load initial data from AsyncStorage
    await this.loadInitialData();
    
    // Start periodic sync
    this.startPeriodicSync();
    
    console.log('SyncService initialized');
  }

  // Load initial data from AsyncStorage or set defaults
  private async loadInitialData(): Promise<void> {
    try {
      // Check if influencers exist in AsyncStorage
      const influencers = await AsyncStorage.getItem('influencers');
      if (!influencers) {
        await this.initializeInfluencers();
      }
      
      // Check if collaborations exist in AsyncStorage
      const collaborations = await AsyncStorage.getItem('collaborations');
      if (!collaborations) {
        await this.initializeCollaborations();
      }
      
      // Initialize sync metadata
      const syncMetadata = await AsyncStorage.getItem('syncMetadata');
      if (!syncMetadata) {
        await AsyncStorage.setItem('syncMetadata', JSON.stringify({
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
    const mockInfluencers: Influencer[] = [
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
      },
      {
        id: '4',
        name: 'Ahmet Yıldız',
        brand: 'Samsung',
        fee: 4200,
        status: 'Tamamlandı',
        collaboration_count: 7,
        category: 'Teknoloji',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
        phone: '+90 555 456 7890',
        email: 'ahmet.yildiz@example.com',
        instagram: 'ahmetyildiz',
        tiktok: 'ahmetyildiz'
      },
      {
        id: '5',
        name: 'Elif Şahin',
        brand: 'Sephora',
        fee: 3800,
        status: 'Beklemede',
        collaboration_count: 4,
        category: 'Güzellik',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
        phone: '+90 555 567 8901',
        email: 'elif.sahin@example.com',
        instagram: 'elifsahin',
        tiktok: 'elifsahin'
      },
      {
        id: '6',
        name: 'Burak Özdemir',
        brand: 'Twitch',
        fee: 6000,
        status: 'Onaylandı',
        collaboration_count: 15,
        category: 'Komedi',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
        phone: '+90 555 678 9012',
        email: 'burak.ozdemir@example.com',
        instagram: 'burakozdemir',
        tiktok: 'burakozdemir'
      },
    ];
    
    await AsyncStorage.setItem('influencers', JSON.stringify(mockInfluencers));
    this.dispatchSyncEvent('influencers', mockInfluencers);
  }

  // Initialize collaborations with mock data if needed
  private async initializeCollaborations(): Promise<void> {
    const mockCollaborations: Collaboration[] = [
      { id: '1', brand: 'Nike', date: '2023-05-15', fee: 5000, collaboration_count: 2, assigned_to: 'ÖNCÜ EVRENSEL', status: 'Tamamlandı', influencer_id: '1', influencer_name: 'Ayşe Yılmaz' },
      { id: '2', brand: 'Adidas', date: '2023-07-22', fee: 4500, collaboration_count: 3, assigned_to: 'CAN AYDIN', status: 'Tamamlandı', influencer_id: '1', influencer_name: 'Ayşe Yılmaz' },
      { id: '3', brand: 'Puma', date: '2023-09-10', fee: 3800, collaboration_count: 1, assigned_to: 'İBRAHİM HALİL BOZDAĞ', status: 'Tamamlandı', influencer_id: '1', influencer_name: 'Ayşe Yılmaz' },
      { id: '4', brand: 'Reebok', date: '2023-11-05', fee: 4200, collaboration_count: 2, assigned_to: 'ÖNCÜ EVRENSEL', status: 'Onaylandı', influencer_id: '1', influencer_name: 'Ayşe Yılmaz' },
      { id: '5', brand: 'Under Armour', date: '2024-01-20', fee: 5500, collaboration_count: 4, assigned_to: 'CAN AYDIN', status: 'Beklemede', influencer_id: '1', influencer_name: 'Ayşe Yılmaz' },
      { id: '6', brand: 'Adidas', date: '2023-06-10', fee: 3500, collaboration_count: 2, assigned_to: 'İBRAHİM HALİL BOZDAĞ', status: 'Tamamlandı', influencer_id: '2', influencer_name: 'Mehmet Demir' },
      { id: '7', brand: 'Nike', date: '2023-08-15', fee: 4000, collaboration_count: 3, assigned_to: 'ÖNCÜ EVRENSEL', status: 'Tamamlandı', influencer_id: '2', influencer_name: 'Mehmet Demir' },
      { id: '8', brand: 'New Balance', date: '2023-10-22', fee: 3200, collaboration_count: 1, assigned_to: 'CAN AYDIN', status: 'Onaylandı', influencer_id: '2', influencer_name: 'Mehmet Demir' },
      { id: '9', brand: 'Puma', date: '2023-07-05', fee: 2800, collaboration_count: 2, assigned_to: 'ÖNCÜ EVRENSEL', status: 'Tamamlandı', influencer_id: '3', influencer_name: 'Zeynep Kaya' },
      { id: '10', brand: 'Reebok', date: '2023-09-18', fee: 3000, collaboration_count: 1, assigned_to: 'İBRAHİM HALİL BOZDAĞ', status: 'Beklemede', influencer_id: '3', influencer_name: 'Zeynep Kaya' },
      { id: '11', brand: 'Samsung', date: '2023-08-10', fee: 4200, collaboration_count: 2, assigned_to: 'CAN AYDIN', status: 'Tamamlandı', influencer_id: '4', influencer_name: 'Ahmet Yıldız' },
      { id: '12', brand: 'Apple', date: '2023-10-15', fee: 5000, collaboration_count: 1, assigned_to: 'ÖNCÜ EVRENSEL', status: 'Tamamlandı', influencer_id: '4', influencer_name: 'Ahmet Yıldız' },
      { id: '13', brand: 'Huawei', date: '2023-12-05', fee: 3800, collaboration_count: 2, assigned_to: 'İBRAHİM HALİL BOZDAĞ', status: 'Onaylandı', influencer_id: '4', influencer_name: 'Ahmet Yıldız' },
      { id: '14', brand: 'Sephora', date: '2023-09-12', fee: 3800, collaboration_count: 1, assigned_to: 'ÖNCÜ EVRENSEL', status: 'Tamamlandı', influencer_id: '5', influencer_name: 'Elif Şahin' },
      { id: '15', brand: 'MAC', date: '2023-11-20', fee: 4200, collaboration_count: 2, assigned_to: 'CAN AYDIN', status: 'Beklemede', influencer_id: '5', influencer_name: 'Elif Şahin' },
      { id: '16', brand: 'Twitch', date: '2023-07-15', fee: 6000, collaboration_count: 3, assigned_to: 'İBRAHİM HALİL BOZDAĞ', status: 'Tamamlandı', influencer_id: '6', influencer_name: 'Burak Özdemir' },
      { id: '17', brand: 'YouTube', date: '2023-09-22', fee: 7500, collaboration_count: 4, assigned_to: 'ÖNCÜ EVRENSEL', status: 'Tamamlandı', influencer_id: '6', influencer_name: 'Burak Özdemir' },
      { id: '18', brand: 'TikTok', date: '2023-11-10', fee: 5500, collaboration_count: 2, assigned_to: 'CAN AYDIN', status: 'Onaylandı', influencer_id: '6', influencer_name: 'Burak Özdemir' },
      { id: '19', brand: 'Instagram', date: '2024-01-05', fee: 8000, collaboration_count: 5, assigned_to: 'İBRAHİM HALİL BOZDAĞ', status: 'Beklemede', influencer_id: '6', influencer_name: 'Burak Özdemir' },
    ];
    
    await AsyncStorage.setItem('collaborations', JSON.stringify(mockCollaborations));
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
      const metadataStr = await AsyncStorage.getItem('syncMetadata');
      const metadata = metadataStr ? JSON.parse(metadataStr) : {};
      metadata.lastSync = Date.now();
      await AsyncStorage.setItem('syncMetadata', JSON.stringify(metadata));
    } catch (error) {
      console.error('Error updating sync metadata:', error);
    }
  }

  // Sync specific data type
  private async syncData(type: SyncableDataType): Promise<void> {
    try {
      const dataStr = await AsyncStorage.getItem(type);
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
    
    // In a real app, this would send data to a server
    // For now, we'll just update AsyncStorage
    AsyncStorage.setItem(type, JSON.stringify(data))
      .catch(error => console.error(`Error saving ${type}:`, error));
    
    // Update last sync timestamp
    this.lastSyncTimestamp[type] = event.timestamp;
  }

  // Save data and trigger sync
  public async saveData(type: SyncableDataType, data: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(type, JSON.stringify(data));
      this.dispatchSyncEvent(type, data);
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
    }
  }

  // Get data with automatic sync
  public async getData<T>(type: SyncableDataType): Promise<T[]> {
    try {
      const dataStr = await AsyncStorage.getItem(type);
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