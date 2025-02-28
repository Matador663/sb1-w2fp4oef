import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { Influencer, CATEGORIES } from '../types';
import useSync from '../hooks/useSync';

const InfluencerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [influencers, setInfluencers] = useSync<Influencer>('influencers');
  const [collaborations, setCollaborations] = useSync<any>('collaborations');

  const [formData, setFormData] = useState<Influencer>({
    name: '',
    brand: '',
    fee: 0,
    status: 'Beklemede',
    collaboration_count: 0,
    image: '',
    category: '',
    phone: '',
    email: '',
    instagram: '',
    tiktok: ''
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && influencers.length > 0) {
      const influencer = influencers.find((inf: Influencer) => inf.id === id);
      
      if (influencer) {
        setFormData(influencer);
      } else {
        setError('Influencer bulunamadı');
      }
    }
  }, [id, isEditMode, influencers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fee' || name === 'collaboration_count' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isEditMode) {
      // Update existing influencer
      const updatedInfluencers = influencers.map((inf: Influencer) => 
        inf.id === id ? { ...formData } : inf
      );
      
      // Update state and sync
      setInfluencers(updatedInfluencers);
      
      // Update collaborations with new influencer name if it changed
      const updatedCollaborations = collaborations.map((collab: any) => {
        if (collab.influencer_id === id) {
          return {
            ...collab,
            influencer_name: formData.name
          };
        }
        return collab;
      });
      
      setCollaborations(updatedCollaborations);
    } else {
      // Add new influencer with generated ID
      const newId = (influencers.length + 1).toString();
      const newInfluencer = {
        ...formData,
        id: newId,
        created_at: new Date()
      };
      
      setInfluencers([...influencers, newInfluencer]);
    }
    
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 1000);
  };

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Influencer Düzenle' : 'Yeni Influencer Ekle'}
        </h1>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} className="mr-1" />
          Geri
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              İsim
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
              Marka
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label htmlFor="fee" className="block text-sm font-medium text-gray-700 mb-1">
              Ücret (₺)
            </label>
            <input
              type="number"
              id="fee"
              name="fee"
              value={formData.fee}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Durum
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="Beklemede">Beklemede</option>
              <option value="Onaylandı">Onaylandı</option>
              <option value="Tamamlandı">Tamamlandı</option>
            </select>
          </div>

          <div>
            <label htmlFor="collaboration_count" className="block text-sm font-medium text-gray-700 mb-1">
              İşbirliği Sayısı
            </label>
            <input
              type="number"
              id="collaboration_count"
              name="collaboration_count"
              value={formData.collaboration_count}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              id="category"
              name="category"
              value={formData.category || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">Kategori Seçin</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefon Numarası
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              placeholder="+90 555 123 4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-posta Adresi
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="ornek@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
              Instagram Kullanıcı Adı
            </label>
            <input
              type="text"
              id="instagram"
              name="instagram"
              value={formData.instagram || ''}
              onChange={handleChange}
              placeholder="kullaniciadi"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label htmlFor="tiktok" className="block text-sm font-medium text-gray-700 mb-1">
              TikTok Kullanıcı Adı
            </label>
            <input
              type="text"
              id="tiktok"
              name="tiktok"
              value={formData.tiktok || ''}
              onChange={handleChange}
              placeholder="kullaniciadi"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Profil Resmi URL (Opsiyonel)
            </label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image || ''}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {formData.image && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Profil Resmi Önizleme</p>
            <img 
              src={formData.image} 
              alt="Profil Önizleme" 
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
            />
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <Save size={18} className="mr-2" />
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InfluencerForm;