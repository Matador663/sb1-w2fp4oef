export interface Influencer {
  id?: string;
  name: string;
  brand: string;
  fee: number;
  status: 'Beklemede' | 'Onaylandı' | 'Tamamlandı';
  collaboration_count: number;
  image?: string;
  category?: string;
  created_at?: Date;
  phone?: string;
  email?: string;
  instagram?: string;
  tiktok?: string;
}

export interface Collaboration {
  id: string;
  brand: string;
  date: string;
  fee: number;
  collaboration_count: number;
  assigned_to: string;
  status: 'Beklemede' | 'Onaylandı' | 'Tamamlandı';
  influencer_id?: string;
  influencer_name?: string;
}

export const TEAM_MEMBERS = [
  'ÖNCÜ EVRENSEL',
  'CAN AYDIN',
  'İBRAHİM HALİL BOZDAĞ'
];

export const CATEGORIES = [
  'Komedi',
  'Dans',
  'Teknoloji',
  'Moda',
  'Güzellik',
  'Spor',
  'Yemek',
  'Seyahat',
  'Oyun',
  'Müzik',
  'Eğitim',
  'Yaşam Tarzı'
];

export const STATUS_COLORS = {
  'Beklemede': {
    background: '#fef9c3', // yellow-100
    text: '#854d0e', // yellow-800
  },
  'Onaylandı': {
    background: '#dbeafe', // blue-100
    text: '#1e40af', // blue-800
  },
  'Tamamlandı': {
    background: '#dcfce7', // green-100
    text: '#166534', // green-800
  }
};