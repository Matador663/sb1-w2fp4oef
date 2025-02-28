import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { read, utils, writeFile } from 'xlsx';
import { Influencer } from '../types';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (influencers: Influencer[]) => void;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    setSuccess(false);
    
    // Check file type
    const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    if (!validTypes.includes(file.type)) {
      setError('Lütfen geçerli bir Excel veya CSV dosyası yükleyin.');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Dosya boyutu 5MB\'dan küçük olmalıdır.');
      return;
    }
    
    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Lütfen bir dosya seçin.');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);
      
      // Validate and transform data
      const influencers: Influencer[] = jsonData.map((row: any, index) => {
        // Map Excel columns to influencer properties
        const influencer: Influencer = {
          name: row.name || row.Name || row.İsim || row.isim || '',
          brand: row.brand || row.Brand || row.Marka || row.marka || '',
          fee: Number(row.fee || row.Fee || row.Ücret || row.ücret || 0),
          status: row.status || row.Status || row.Durum || row.durum || 'Beklemede',
          collaboration_count: Number(row.collaboration_count || row.CollaborationCount || row['İşbirliği Sayısı'] || row['işbirliği sayısı'] || 0),
          category: row.category || row.Category || row.Kategori || row.kategori || '',
          image: row.image || row.Image || row['Profil Resmi'] || row['profil resmi'] || '',
          phone: row.phone || row.Phone || row.Telefon || row.telefon || '',
          email: row.email || row.Email || row['E-posta'] || row['e-posta'] || '',
          instagram: row.instagram || row.Instagram || '',
          tiktok: row.tiktok || row.TikTok || row.Tiktok || '',
          id: (Date.now() + index).toString() // Generate unique ID
        };
        
        // Validate required fields
        if (!influencer.name) throw new Error(`Satır ${index + 1}: İsim alanı boş olamaz.`);
        if (!influencer.brand) throw new Error(`Satır ${index + 1}: Marka alanı boş olamaz.`);
        
        return influencer;
      });
      
      if (influencers.length === 0) {
        throw new Error('Dosyada hiç veri bulunamadı.');
      }
      
      // Call the success callback with the parsed influencers
      onUploadSuccess(influencers);
      setSuccess(true);
      
      // Reset form after successful upload
      setTimeout(() => {
        setFile(null);
        setSuccess(false);
        onClose();
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || 'Dosya işlenirken bir hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  const generateExampleFile = () => {
    // Create sample data
    const data = [
      {
        name: 'Örnek İsim',
        brand: 'Örnek Marka',
        fee: 5000,
        status: 'Beklemede',
        collaboration_count: 3,
        category: 'Moda',
        image: 'https://example.com/image.jpg',
        phone: '+90 555 123 4567',
        email: 'ornek@email.com',
        instagram: 'ornekkullanici',
        tiktok: 'ornekkullanici'
      },
      {
        name: 'İkinci Örnek',
        brand: 'Başka Marka',
        fee: 3500,
        status: 'Onaylandı',
        collaboration_count: 5,
        category: 'Spor',
        image: 'https://example.com/image2.jpg',
        phone: '+90 555 987 6543',
        email: 'ikinci@email.com',
        instagram: 'ikincikullanici',
        tiktok: 'ikincikullanici'
      }
    ];
    
    // Create worksheet
    const ws = utils.json_to_sheet(data);
    
    // Create workbook
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Influencers');
    
    // Generate file and trigger download
    writeFile(wb, 'influencer_ornegi.xlsx');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Toplu Influencer Yükleme</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 ${
              isDragging ? 'border-rose-500 bg-rose-50' : 'border-gray-300'
            } ${file ? 'bg-green-50' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex items-center justify-center flex-col">
                <FileSpreadsheet size={48} className="text-green-600 mb-2" />
                <p className="font-medium text-green-700">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <button 
                  onClick={() => setFile(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Dosyayı Kaldır
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload size={48} className="text-gray-400 mb-2" />
                <p className="text-gray-600 mb-2">
                  Excel dosyanızı buraya sürükleyin veya
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
                >
                  Dosya Seçin
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                />
              </div>
            )}
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-start mb-4">
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-center mb-4">
              <CheckCircle size={18} className="mr-2 flex-shrink-0" />
              <p>Influencerlar başarıyla yüklendi!</p>
            </div>
          )}
          
          <div className="mt-4 flex justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {uploading ? 'Yükleniyor...' : 'Yükle'}
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-b-lg border-t">
          <h3 className="font-medium text-gray-700 mb-2">Excel Dosya Formatı</h3>
          <p className="text-sm text-gray-600 mb-2">
            Excel dosyanız aşağıdaki sütunları içermelidir:
          </p>
          <ul className="text-sm text-gray-600 list-disc pl-5 mb-3">
            <li>name (İsim) - Zorunlu</li>
            <li>brand (Marka) - Zorunlu</li>
            <li>fee (Ücret)</li>
            <li>status (Durum)</li>
            <li>collaboration_count (İşbirliği Sayısı)</li>
            <li>category (Kategori)</li>
            <li>image (Profil Resmi URL)</li>
            <li>phone (Telefon)</li>
            <li>email (E-posta)</li>
            <li>instagram (Instagram Kullanıcı Adı)</li>
            <li>tiktok (TikTok Kullanıcı Adı)</li>
          </ul>
          <button
            onClick={generateExampleFile}
            className="flex items-center text-rose-600 hover:text-rose-800 text-sm"
          >
            <Download size={14} className="mr-1" />
            Örnek Excel Dosyası İndir
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;