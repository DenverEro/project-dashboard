
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Doc, Project } from '../types';
import { FileText, Plus, Search, ExternalLink, Tag, X, Loader2 } from 'lucide-react';

const Documents: React.FC = () => {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New Doc Form State
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [docsRes, projectsRes] = await Promise.all([
      supabase.from('docs').select('*, projects(name)').order('created_at', { ascending: false }),
      supabase.from('projects').select('id, name')
    ]);
    
    if (docsRes.data) setDocs(docsRes.data.map(d => ({ ...d, project: d.projects })));
    if (projectsRes.data) setProjects(projectsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSaving(true);
    const { error } = await supabase.from('docs').insert({
      title: newTitle,
      body: newBody,
      project_id: newProjectId || null
    });

    if (!error) {
      setNewTitle('');
      setNewBody('');
      setNewProjectId('');
      setIsModalOpen(false);
      fetchData();
    }
    setIsSaving(false);
  };

  const filteredDocs = docs.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.body?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <p className="text-zinc-500 text-sm mt-1">Shared knowledge and project assets</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search docs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700 w-64"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Plus size={18} />
            New Document
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="bg-[#111112] border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all group flex flex-col h-full shadow-lg hover:shadow-indigo-500/5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 transition-colors">
                <FileText size={20} />
              </div>
              <button className="text-zinc-600 hover:text-white transition-colors">
                <ExternalLink size={16} />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-indigo-200 transition-colors">{doc.title}</h3>
            <p className="text-sm text-zinc-500 line-clamp-3 mb-6 flex-grow leading-relaxed">{doc.body || 'No content provided.'}</p>
            
            <div className="pt-4 border-t border-zinc-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <Tag size={12} className="text-zinc-600 flex-shrink-0" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider truncate">
                  {doc.project?.name || 'General'}
                </span>
              </div>
              <span className="text-[10px] text-zinc-600 font-mono whitespace-nowrap ml-2">
                {new Date(doc.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
        {filteredDocs.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center text-zinc-600 border-2 border-dashed border-zinc-900 rounded-2xl">
            <FileText size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-lg font-medium text-zinc-500">No documents found</p>
            <p className="text-sm">Store meeting notes, requirements, and guides here.</p>
          </div>
        )}
      </div>

      {/* New Document Modal (Side Panel) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg h-full bg-[#111112] border-l border-zinc-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Create New Document</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateDoc} className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Document Title</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#0c0c0d] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="e.g. API Specification v1"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Link to Project</label>
                <select 
                  value={newProjectId} 
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full bg-[#0c0c0d] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="">General (No Project)</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Content</label>
                <textarea 
                  value={newBody} 
                  onChange={(e) => setNewBody(e.target.value)}
                  rows={12}
                  className="w-full bg-[#0c0c0d] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none font-sans"
                  placeholder="Start typing your document content here..."
                />
              </div>
            </form>
            <div className="p-6 border-t border-zinc-800 flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-zinc-400 hover:text-zinc-200 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateDoc}
                disabled={isSaving || !newTitle.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                Create Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
