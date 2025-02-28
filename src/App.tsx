import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Briefcase, PlusCircle } from 'lucide-react';
import InfluencerList from './components/InfluencerList';
import InfluencerForm from './components/InfluencerForm';
import InfluencerProfile from './components/InfluencerProfile';
import JobTracking from './components/JobTracking';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-rose-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
              <img src="https://i.ibb.co/Qj1Hnkz/ajans-logo.png" alt="Ajans Logo" className="h-10" />
              <span>Influencer Ajansı</span>
            </Link>
            <Link to="/jobs" className="flex items-center space-x-2 text-white hover:text-rose-100 transition-colors">
              <Briefcase size={20} />
              <span>İş Takibi</span>
            </Link>
          </div>
          <Link 
            to="/add" 
            className="flex items-center space-x-1 bg-white text-rose-600 px-4 py-2 rounded-md font-medium hover:bg-rose-50 transition-colors"
          >
            <PlusCircle size={18} />
            <span>Influencer Ekle</span>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<InfluencerList />} />
          <Route path="/add" element={<InfluencerForm />} />
          <Route path="/edit/:id" element={<InfluencerForm />} />
          <Route path="/profile/:id" element={<InfluencerProfile />} />
          <Route path="/jobs" element={<JobTracking />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;