
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Documents from './components/Documents';
import { supabase, isSupabaseConfigured } from './supabase';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isConfigured, setIsConfigured] = useState(isSupabaseConfigured());

  // Listen for config changes if any
  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());
  }, []);

  if (!isConfigured) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0c0c0d] text-zinc-400 p-8 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-4 text-white">Supabase Connection Required</h1>
          <p className="max-w-md">
            Please set the <code className="bg-zinc-800 px-1 rounded text-pink-400">SUPABASE_URL</code> and 
            <code className="bg-zinc-800 px-1 rounded text-pink-400">SUPABASE_ANON_KEY</code> 
            environment variables to connect this dashboard to your backend.
          </p>
          <div className="mt-8 p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-left">
            <h2 className="text-sm font-semibold uppercase text-zinc-500 mb-2">Required Tables:</h2>
            <ul className="text-sm list-disc list-inside space-y-1">
              <li>projects</li>
              <li>tasks</li>
              <li>docs</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-[#0c0c0d] overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'ml-0' : 'ml-0'}`}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/content" element={<Documents />} /> {/* Alias for docs in PNG */}
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
