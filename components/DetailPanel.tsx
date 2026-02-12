
import React, { useState, useEffect } from 'react';
import { Task, Project, Priority, Status, ProjectStatus, ProjectType } from '../types';
import { X, Trash2, Save, Calendar, Clock } from 'lucide-react';

interface DetailPanelProps {
  type: 'task' | 'project';
  isOpen: boolean;
  data: any;
  projects: Project[];
  onClose: () => void;
  onSave: (data: any) => void;
  onDelete: (id: string) => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ type, isOpen, data, projects, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (data) {
      setFormData({ ...data });
    }
  }, [data]);

  if (!isOpen || !formData) return null;

  const isTask = type === 'task';

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-900 z-[60] shadow-2xl transition-transform transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold tracking-tight">{isTask ? 'Task Details' : 'Project Details'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Title</label>
              <input 
                type="text" 
                value={isTask ? formData.title : formData.name}
                onChange={(e) => setFormData({ ...formData, [isTask ? 'title' : 'name']: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-accent"
                placeholder="Enter title..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-accent resize-none"
                placeholder="Details about this item..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                >
                  {isTask ? (
                    ['Todo', 'In Progress', 'Done', 'Stalled'].map(s => <option key={s} value={s}>{s}</option>)
                  ) : (
                    ['Active', 'Paused', 'Completed'].map(s => <option key={s} value={s}>{s}</option>)
                  )}
                </select>
              </div>

              {isTask ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                  >
                    {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ProjectType })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                  >
                    {['Agency', 'Internal', 'Content'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}
            </div>

            {isTask && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Due Date</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input 
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Assignee</label>
                  <input 
                    type="text"
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-accent"
                    placeholder="Initials..."
                  />
                </div>
              </div>
            )}

            {isTask && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Project Association</label>
                <select 
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                >
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}
            
            {isTask && formData.stalledAt && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/20 border border-red-900/30 text-red-400 text-xs">
                <Clock size={14} />
                <span>Stalled since: {new Date(formData.stalledAt).toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-900 flex items-center justify-between">
            <button 
              onClick={() => onDelete(formData.id)}
              className="flex items-center gap-2 text-red-500 hover:text-red-400 text-sm font-medium transition-colors"
            >
              <Trash2 size={16} />
              Delete {isTask ? 'Task' : 'Project'}
            </button>
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => onSave(formData)}
                className="flex items-center gap-2 bg-accent hover:bg-accent/90 px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-accent/20 transition-all active:scale-95"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailPanel;
