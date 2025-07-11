import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { User, Edit, ArrowLeft, Calendar, DollarSign, BarChart, Save, Plus, X, Tag, Phone, Mail, Instagram, ExternalLink } from 'lucide-react';
import { Influencer, Collaboration, TEAM_MEMBERS, CATEGORIES } from '../types';
import useSync from '../hooks/useSync';

const InfluencerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [influencers, setInfluencers] = useSync<Influencer>('influencers');
  const [allCollaborations, setAllCollaborations] = useSync<Collaboration>('collaborations');
  
  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // For editing collaborations
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Collaboration | null>(null);
  
  // For editing category
  const [isEditingCategory, setIsEditingCategory] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // For adding new collaboration
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newCollaboration, setNewCollaboration] = useState<Omit<Collaboration, 'id'>>({
    brand: '',
    date: new Date().toISOString().split('T')[0],
    fee: 0,
    collaboration_count: 1,
    assigned_to: TEAM_MEMBERS[0],
    status: 'Beklemede'
  });

  useEffect(() => {
    if (influencers.length > 0 && id) {
      const foundInfluencer = influencers.find((inf: Influencer) => inf.id === id);
      
      if (foundInfluencer) {
        setInfluencer(foundInfluencer);
        setSelectedCategory(foundInfluencer.category || '');
        
        // Filter collaborations for this influencer
        const influencerCollaborations = allCollaborations.filter(
          (collab: Collaboration) => collab.influencer_id === id
        );
        setCollaborations(influencerCollaborations);
      } else {
        setError('Influencer bulunamadı');
      }
      
      setLoading(false);
    }
  }, [id, influencers, allCollaborations]);

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

  const handleEditClick = (collab: Collaboration) => {
    setEditingId(collab.id);
    setEditForm({ ...collab });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editForm) return;
    
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: name === 'fee' || name === 'collaboration_count' ? Number(value) : value
    });
  };

  const handleEditSave = () => {
    if (!editForm) return;
    
    // Update in all collaborations
    const updatedCollaborations = allCollaborations.map(c => 
      c.id === editForm.id ? editForm : c
    );
    
    // Update through sync hook
    setAllCollaborations(updatedCollaborations);
    
    // Update local state
    setCollaborations(collaborations.map(c => 
      c.id === editForm.id ? editForm : c
    ));
    
    setEditingId(null);
    setEditForm(null);
  };

  const handleNewCollabChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewCollaboration({
      ...newCollaboration,
      [name]: name === 'fee' || name === 'collaboration_count' ? Number(value) : value
    });
  };

  const handleAddCollaboration = () => {
    if (!influencer) return;
    
    // Generate new ID
    const newId = (allCollaborations.length + 1).toString();
    
    // Create new collaboration
    const newCollab = {
      id: newId,
      ...newCollaboration,
      influencer_id: influencer.id,
      influencer_name: influencer.name
    };
    
    // Update all collaborations through sync hook
    setAllCollaborations([...allCollaborations, newCollab]);
    
    // Update local state
    setCollaborations([...collaborations, newCollab]);
    
    // Reset form
    setIsAddingNew(false);
    setNewCollaboration({
      brand: '',
      date: new Date().toISOString().split('T')[0],
      fee: 0,
      collaboration_count: 1,
      assigned_to: TEAM_MEMBERS[0],
      status: 'Beklemede'
    });
    
    // Update influencer collaboration count
    if (influencer) {
      const updatedInfluencer = {
        ...influencer,
        collaboration_count: influencer.collaboration_count + 1
      };
      
      // Update local state
      setInfluencer(updatedInfluencer);
      
      // Update in all influencers through sync hook
      const updatedInfluencers = influencers.map((inf: Influencer) => 
        inf.id === influencer.id ? updatedInfluencer : inf
      );
      
      setInfluencers(updatedInfluencers);
    }
  };

  const handleDeleteCollaboration = (id: string) => {
    if (window.confirm('Bu işbirliğini silmek istediğinize emin misiniz?')) {
      // Update all collaborations through sync hook
      const updatedCollaborations = allCollaborations.filter(c => c.id !== id);
      setAllCollaborations(updatedCollaborations);
      
      // Update local state
      const filteredCollaborations = collaborations.filter(c => c.id !== id);
      setCollaborations(filteredCollaborations);
      
      // Update influencer collaboration count
      if (influencer) {
        const updatedInfluencer = {
          ...influencer,
          collaboration_count: Math.max(0, influencer.collaboration_count - 1)
        };
        
        // Update local state
        setInfluencer(updatedInfluencer);
        
        // Update in all influencers through sync hook
        const updatedInfluencers = influencers.map((inf: Influencer) => 
          inf.id === influencer.id ? updatedInfluencer : inf
        );
        
        setInfluencers(updatedInfluencers);
      }
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const saveCategory = () => {
    if (influencer) {
      const updatedInfluencer = {
        ...influencer,
        category: selectedCategory
      };
      
      // Update local state
      setInfluencer(updatedInfluencer);
      
      // Update in all influencers through sync hook
      const updatedInfluencers = influencers.map((inf: Influencer) => 
        inf.id === influencer.id ? updatedInfluencer : inf
      );
      
      setInfluencers(updatedInfluencers);
      
      setIsEditingCategory(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  if (error || !influencer) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md">
        {error || 'Bir hata oluştu'}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} className="mr-1" />
          Geri
        </button>
        <Link 
          to={`/edit/${influencer.id}`}
          className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
        >
          <Edit size={18} className="mr-2" />
          Düzenle
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-rose-600 h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-6">
            {influencer.image ? (
              <img 
                src={influencer.image} 
                alt={influencer.name} 
                className="w-32 h-32 rounded-full border-4 border-white object-cover mr-0 sm:mr-6"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-rose-100 flex items-center justify-center border-4 border-white mr-0 sm:mr-6">
                <User size={64} className="text-rose-600" />
              </div>
            )}
            <div className="text-center sm:text-left mt-4 sm:mt-0">
              <h1 className="text-3xl font-bold">{influencer.name}</h1>
              <p className="text-gray-600">{influencer.brand}</p>
              
              <div className="mt-2 flex items-center">
                <Tag size={16} className="text-rose-600 mr-2" />
                
                {isEditingCategory ? (
                  <div className="flex items-center">
                    <select
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 mr-2"
                    >
                      <option value="">Kategori Seçin</option>
                      {CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <button 
                      onClick={saveCategory}
                      className="text-green-600 hover:text-green-800 mr-1"
                    >
                      <Save size={16} />
                    </button>
                    <button 
                      onClick={() => setIsEditingCategory(false)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="text-sm px-2 py-1 rounded-full bg-rose-100 text-rose-800 mr-2">
                      {influencer.category || 'Kategori Yok'}
                    </span>
                    <button 
                      onClick={() => setIsEditingCategory(true)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">İletişim Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {influencer.phone && (
                <div className="flex items-center">
                  <Phone size={18} className="text-rose-600 mr-2" />
                  <span>{influencer.phone}</span>
                </div>
              )}
              
              {influencer.email && (
                <div className="flex items-center">
                  <Mail size={18} className="text-rose-600 mr-2" />
                  <a href={`mailto:${influencer.email}`} className="text-rose-600 hover:underline">
                    {influencer.email}
                  </a>
                </div>
              )}
              
              {influencer.instagram && (
                <div className="flex items-center">
                  <Instagram size={18} className="text-rose-600 mr-2" />
                  <a 
                    href={`https://instagram.com/${influencer.instagram}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-rose-600 hover:underline flex items-center"
                  >
                    @{influencer.instagram}
                    <ExternalLink size={14} className="ml-1" />
                  </a>
                </div>
              )}
              
              {influencer.tiktok && (
                <div className="flex items-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-rose-600 mr-2"
                  >
                    <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
                    <path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>
                    <path d="M15 8v8a4 4 0 0 1-4 4"></path>
                    <line x1="15" y1="4" x2="15" y2="12"></line>
                  </svg>
                  <a 
                    href={`https://tiktok.com/@${influencer.tiktok}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-rose-600 hover:underline flex items-center"
                  >
                    @{influencer.tiktok}
                    <ExternalLink size={14} className="ml-1" />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-rose-50 p-4 rounded-lg flex items-center">
              <div className="bg-rose-100 p-3 rounded-full mr-4">
                <BarChart size={24} className="text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">İşbirliği Sayısı</p>
                <p className="text-xl font-semibold">{influencer.collaboration_count}</p>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <DollarSign size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ücret</p>
                <p className="text-xl font-semibold">{(influencer.fee || 0).toLocaleString('tr-TR')} ₺</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Calendar size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Durum</p>
                <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(influencer.status)}`}>
                  {influencer.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">İşbirliği Geçmişi</h2>
          <button 
            onClick={() => setIsAddingNew(true)}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Plus size={16} className="mr-1" />
            Yeni İşbirliği Ekle
          </button>
        </div>
        
        {isAddingNew && (
          <div className="mb-6 p-4 border border-green-200 rounded-lg bg-green-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-green-800">Yeni İşbirliği</h3>
              <button 
                onClick={() => setIsAddingNew(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marka</label>
                <input
                  type="text"
                  name="brand"
                  value={newCollaboration.brand}
                  onChange={handleNewCollabChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
                <input
                  type="date"
                  name="date"
                  value={newCollaboration.date}
                  onChange={handleNewCollabChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ücret (₺)</label>
                <input
                  type="number"
                  name="fee"
                  value={newCollaboration.fee}
                  onChange={handleNewCollabChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İşbirliği Sayısı</label>
                <input
                  type="number"
                  name="collaboration_count"
                  value={newCollaboration.collaboration_count}
                  onChange={handleNewCollabChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Atanan Kişi</label>
                <select
                  name="assigned_to"
                  value={newCollaboration.assigned_to}
                  onChange={handleNewCollabChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                >
                  {TEAM_MEMBERS.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                <select
                  name="status"
                  value={newCollaboration.status}
                  onChange={handleNewCollabChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                >
                  <option value="Beklemede">Beklemede</option>
                  <option value="Onaylandı">Onaylandı</option>
                  <option value="Tamamlandı">Tamamlandı</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAddCollaboration}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Save size={16} className="mr-2" />
                Kaydet
              </button>
            </div>
          </div>
        )}
        
        {collaborations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Henüz işbirliği kaydı bulunmamaktadır.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marka
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ücret
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşbirliği Sayısı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Atanan Kişi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {collaborations.map((collab) => (
                  <tr key={collab.id}>
                    {editingId === collab.id ? (
                      // Edit mode
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            name="brand"
                            value={editForm?.brand || ''}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-rose-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="date"
                            name="date"
                            value={editForm?.date || ''}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-rose-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            name="fee"
                            value={editForm?.fee || 0}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-rose-500"
                            min="0"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            name="collaboration_count"
                            value={editForm?.collaboration_count || 0}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-rose-500"
                            min="1"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            name="assigned_to"
                            value={editForm?.assigned_to || ''}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-rose-500"
                          >
                            {TEAM_MEMBERS.map(member => (
                              <option key={member} value={member}>{member}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            name="status"
                            value={editForm?.status || ''}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-rose-500"
                          >
                            <option value="Beklemede">Beklemede</option>
                            <option value="Onaylandı">Onaylandı</option>
                            <option value="Tamamlandı">Tamamlandı</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={handleEditSave}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </>
                    ) : (
                      // View mode
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{collab.brand}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(collab.date).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(collab.fee || 0).toLocaleString('tr-TR')} ₺
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {collab.collaboration_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {collab.assigned_to}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(collab.status)}`}>
                            {collab.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleEditClick(collab)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCollaboration(collab.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfluencerProfile;