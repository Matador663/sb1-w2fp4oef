import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Edit, Eye, Trash2, Search, Filter, PlusCircle, X, Upload } from 'lucide-react';
import { Influencer, CATEGORIES } from '../types';
import BulkUploadModal from './BulkUploadModal';
import useSync from '../hooks/useSync';

const InfluencerList: React.FC = () => {
  const [influencers, setInfluencers] = useSync<Influencer>('influencers');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    category: '',
    status: ''
  });
  const [showBulkUploadModal, setShowBulkUploadModal] = useState<boolean>(false);

  useEffect(() => {
    // Data is loaded from the useSync hook
    setLoading(false);
  }, [influencers]);

  const handleDelete = (id: string) => {
    if (window.confirm('Bu influencer\'ı silmek istediğinize emin misiniz?')) {
      const updatedInfluencers = influencers.filter(influencer => influencer.id !== id);
      setInfluencers(updatedInfluencers);
      
      // Also remove collaborations for this influencer
      const storedCollaborations = localStorage.getItem('collaborations');
      if (storedCollaborations) {
        const collaborations = JSON.parse(storedCollaborations);
        const updatedCollaborations = collaborations.filter((collab: any) => collab.influencer_id !== id);
        localStorage.setItem('collaborations', JSON.stringify(updatedCollaborations));
        
        // Dispatch event for collaboration updates
        const event = new CustomEvent('collaborationsUpdated', { detail: updatedCollaborations });
        window.dispatchEvent(event);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Beklemede':
        return 'bg-yellow-100 text-yellow-800';
      case 'Onaylandı':
        return 'bg-blue-100 text-blue-800';
      case 'Tamamlandı':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      status: ''
    });
    setSearchTerm('');
  };

  const handleBulkUploadSuccess = (newInfluencers: Influencer[]) => {
    // Combine existing and new influencers
    const updatedInfluencers = [...influencers, ...newInfluencers];
    
    // Update state and localStorage through the sync hook
    setInfluencers(updatedInfluencers);
  };

  const filteredInfluencers = influencers.filter(influencer => {
    // Apply search term
    const matchesSearch = searchTerm === '' || 
      influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      influencer.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (influencer.category && influencer.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply filters
    const matchesCategory = filters.category === '' || influencer.category === filters.category;
    const matchesStatus = filters.status === '' || influencer.status === filters.status;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Influencer Listesi</h1>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 bg-rose-100 text-rose-700 rounded-md hover:bg-rose-200"
          >
            <Filter size={18} className="mr-1" />
            Filtrele
          </button>
          
          <Link 
            to="/add" 
            className="flex items-center px-3 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
          >
            <PlusCircle size={18} className="mr-1" />
            Ekle
          </Link>
          
          <button
            onClick={() => setShowBulkUploadModal(true)}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Upload size={18} className="mr-1" />
            Toplu Yükle
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Filtreler</h3>
            <button 
              onClick={resetFilters}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Filtreleri Temizle
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">Tümü</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">Tümü</option>
                <option value="Beklemede">Beklemede</option>
                <option value="Onaylandı">Onaylandı</option>
                <option value="Tamamlandı">Tamamlandı</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {filteredInfluencers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">Filtrelere uygun influencer bulunamadı.</p>
          <Link 
            to="/add" 
            className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
          >
            <PlusCircle size={18} className="mr-2" />
            Influencer Ekle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInfluencers.map((influencer) => (
            <div key={influencer.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-5">
                <div className="flex items-center mb-4">
                  {influencer.image ? (
                    <img 
                      src={influencer.image} 
                      alt={influencer.name} 
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mr-4">
                      <User size={24} className="text-rose-600" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold">{influencer.name}</h2>
                    <p className="text-gray-600">{influencer.brand}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-500">İşbirliği Sayısı</p>
                    <p className="font-semibold">{influencer.collaboration_count}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ücret</p>
                    <p className="font-semibold">{(influencer.fee || 0).toLocaleString('tr-TR')} ₺</p>
                  </div>
                  <div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(influencer.status)}`}>
                      {influencer.status}
                    </span>
                  </div>
                </div>
                
                {influencer.category && (
                  <div className="mb-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-rose-100 text-rose-800">
                      {influencer.category}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between pt-4 border-t">
                  <Link 
                    to={`/profile/${influencer.id}`}
                    className="text-rose-600 hover:text-rose-800 flex items-center"
                  >
                    <Eye size={16} className="mr-1" />
                    Profil
                  </Link>
                  <Link 
                    to={`/edit/${influencer.id}`}
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Edit size={16} className="mr-1" />
                    Düzenle
                  </Link>
                  <button 
                    onClick={() => handleDelete(influencer.id!)}
                    className="text-red-600 hover:text-red-800 flex items-center"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 text-right text-sm text-gray-500">
        Toplam {filteredInfluencers.length} influencer gösteriliyor
      </div>
      
      {/* Bulk Upload Modal */}
      <BulkUploadModal 
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        onUploadSuccess={handleBulkUploadSuccess}
      />
    </div>
  );
};

export default InfluencerList;