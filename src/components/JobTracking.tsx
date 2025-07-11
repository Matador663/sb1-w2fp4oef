import React, { useState, useEffect } from 'react';
import { Download, Search, Filter, X, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Collaboration, TEAM_MEMBERS } from '../types';
import useSync from '../hooks/useSync';
import { utils, writeFile } from 'xlsx';

const JobTracking: React.FC = () => {
  const [collaborations, setCollaborations] = useSync<Collaboration>('collaborations');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState({
    status: '',
    assignedTo: '',
    brand: '',
    influencer: ''
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    // Data is loaded from the useSync hook
    setLoading(false);
  }, [collaborations]);

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
      status: '',
      assignedTo: '',
      brand: '',
      influencer: ''
    });
    setSearchTerm('');
  };

  const exportToExcel = () => {
    // Create a worksheet from the filtered data
    const worksheet = utils.json_to_sheet(
      filteredCollaborations.map(collab => ({
        Marka: collab.brand,
        Influencer: collab.influencer_name || '',
        Tarih: new Date(collab.date).toLocaleDateString('tr-TR'),
        'Ücret (₺)': collab.fee,
        'İşbirliği Sayısı': collab.collaboration_count,
        'Atanan Kişi': collab.assigned_to,
        Durum: collab.status
      }))
    );
    
    // Set column widths
    const wscols = [
      { wch: 15 }, // Marka
      { wch: 20 }, // Influencer
      { wch: 12 }, // Tarih
      { wch: 10 }, // Ücret
      { wch: 15 }, // İşbirliği Sayısı
      { wch: 20 }, // Atanan Kişi
      { wch: 12 }  // Durum
    ];
    worksheet['!cols'] = wscols;
    
    // Create a workbook
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'İşbirliği Listesi');
    
    // Generate Excel file and trigger download
    writeFile(workbook, `İşbirliği_Listesi_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredCollaborations = collaborations.filter(collab => {
    // Apply search term
    const matchesSearch = searchTerm === '' || 
      collab.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collab.assigned_to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (collab.influencer_name && collab.influencer_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply filters
    const matchesStatus = filters.status === '' || collab.status === filters.status;
    const matchesAssignedTo = filters.assignedTo === '' || collab.assigned_to === filters.assignedTo;
    const matchesBrand = filters.brand === '' || collab.brand === filters.brand;
    const matchesInfluencer = filters.influencer === '' || collab.influencer_name === filters.influencer;
    
    return matchesSearch && matchesStatus && matchesAssignedTo && matchesBrand && matchesInfluencer;
  });

  // Get unique brands for filter dropdown
  const uniqueBrands = Array.from(new Set(collaborations.map(c => c.brand)));
  
  // Get unique influencers for filter dropdown
  const uniqueInfluencers = Array.from(new Set(collaborations.map(c => c.influencer_name).filter(Boolean)));

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">İş Takibi</h1>
        
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
          
          <button
            onClick={exportToExcel}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Download size={18} className="mr-1" />
            Excel'e Aktar
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Atanan Kişi</label>
              <select
                name="assignedTo"
                value={filters.assignedTo}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">Tümü</option>
                {TEAM_MEMBERS.map(member => (
                  <option key={member} value={member}>{member}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marka</label>
              <select
                name="brand"
                value={filters.brand}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">Tümü</option>
                {uniqueBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Influencer</label>
              <select
                name="influencer"
                value={filters.influencer}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">Tümü</option>
                {uniqueInfluencers.map(influencer => (
                  <option key={influencer} value={influencer}>{influencer}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Marka
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Influencer
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
                Profil
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCollaborations.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  Filtrelere uygun sonuç bulunamadı.
                </td>
              </tr>
            ) : (
              filteredCollaborations.map((collab) => (
                <tr key={collab.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{collab.brand}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {collab.influencer_name ? (
                      <div className="text-rose-600 font-medium">{collab.influencer_name}</div>
                    ) : (
                      <div className="text-gray-500">-</div>
                    )}
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
                    {collab.influencer_id && (
                      <Link 
                        to={`/profile/${collab.influencer_id}`}
                        className="text-rose-600 hover:text-rose-900"
                      >
                        <LinkIcon size={16} />
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-right text-sm text-gray-500">
        Toplam {filteredCollaborations.length} işbirliği gösteriliyor
      </div>
    </div>
  );
};

export default JobTracking;