import React from 'react';
import { Download } from 'lucide-react';
import { utils, writeFile } from 'xlsx';

const ExampleExcel: React.FC = () => {
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
    <button
      onClick={generateExampleFile}
      className="flex items-center text-indigo-600 hover:text-indigo-800 mt-2 text-sm"
    >
      <Download size={14} className="mr-1" />
      Örnek Excel Dosyası İndir
    </button>
  );
};

export default ExampleExcel;