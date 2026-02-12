
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Project } from '../types';
import { MoreHorizontal, Plus, Search, Layers, Clock, CheckCircle2, PauseCircle, Ban, X, Loader2 } from 'lucide-react';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New Project Form State
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('Agency');
  const [newStatus, setNewStatus] = useState<'Active' | 'Paused' | 'Completed' | 'Stalled'>('Active');
  const [isSaving, setIsSaving] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (data) setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSaving(true);
    const { error } = await supabase.from('projects').insert({
      name: newName,
      description: newDesc,
      type: newType,
      status: newStatus
    });

    if (!error) {
      setNewName('');
      setNewDesc('');
      setIsModalOpen(false);
      fetchProjects();
    }
    setIsSaving(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <Clock size={14} className="text-emerald-500" />;
      case 'Paused': return <PauseCircle size={14} className="text-amber-500" />;
      case 'Completed': return <CheckCircle2 size={14} className="text-blue-500" />;
      case 'Stalled': return <Ban size={14} className="text-rose-500" />;
      default: return null;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Paused': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Completed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Stalled': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-zinc-500 text-sm mt-1">{projects.length} total projects in workspace</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search projects..." 
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
            New Project
          </button>
        </div>
      </header>

      <div className="bg-[#111112] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-900/50 text-[10px] uppercase font-bold text-zinc-500 border-b border-zinc-800 tracking-widest">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filteredProjects.map((project) => (
              <tr key={project.id} className="hover:bg-zinc-800/20 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 transition-colors border border-zinc-700/50">
                      <Layers size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors">{project.name}</h3>
                      <p className="text-xs text-zinc-500 truncate max-w-[300px]">{project.description || 'No description'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(project.status)}`}>
                    {getStatusIcon(project.status)}
                    {project.status}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                    {project.type || 'Internal'}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-xs text-zinc-400 font-mono">
                    {project.due_date ? new Date(project.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="text-zinc-600 hover:text-white transition-colors p-1 rounded-md hover:bg-zinc-800">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProjects.length === 0 && !loading && (
          <div className="p-20 text-center text-zinc-500">
            <Layers size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-lg font-medium">No projects found</p>
            <p className="text-sm">Try adjusting your search or create a new project.</p>
          </div>
        )}
      </div>

      {/* New Project Modal (Side Panel) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md h-full bg-[#111112] border-l border-zinc-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Create New Project</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Project Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#0c0c0d] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="e.g. Project Phoenix"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Type</label>
                <select 
                  value={newType} 
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-[#0c0c0d] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="Agency">Agency</option>
                  <option value="Internal">Internal</option>
                  <option value="Content">Content</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</label>
                <select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full bg-[#0c0c0d] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Stalled">Stalled</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Description</label>
                <textarea 
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={4}
                  className="w-full bg-[#0c0c0d] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                  placeholder="What is this project about?"
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
                onClick={handleCreateProject}
                disabled={isSaving || !newName.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
