
import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, Layout, User, Type, MessageSquare, Sparkles, Loader2 } from 'lucide-react';
import { Task, Project } from '../types';
import { supabase } from '../supabase';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  projects: Project[];
  onUpdate: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, projects, onUpdate }) => {
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes || '');
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [projectId, setProjectId] = useState(task.project_id || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  useEffect(() => {
    setTitle(task.title);
    setNotes(task.notes || '');
    setStatus(task.status);
    setPriority(task.priority);
    setProjectId(task.project_id || '');
  }, [task]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await supabase.from('tasks').update({
      title,
      notes,
      status,
      priority,
      project_id: projectId || null,
      updated_at: new Date().toISOString()
    }).eq('id', task.id);
    
    setIsSaving(false);
    onUpdate();
    onClose();
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await supabase.from('tasks').delete().eq('id', task.id);
      onUpdate();
      onClose();
    }
  };

  const simulateAiUpdate = async () => {
    setIsAiProcessing(true);
    // Mimic API POST /api/tasks-update
    await new Promise(r => setTimeout(r, 1500));
    
    // Auto-generate some AI notes
    const aiNotes = `AI Generated Analysis:\n- Priority escalated due to proximity to deadline.\n- Technical audit suggested for dependencies in ${projects.find(p => p.id === projectId)?.name}.\n- Estimated effort: 4-6 hours.`;
    
    setNotes(prev => prev + (prev ? '\n\n' : '') + aiNotes);
    setPriority(1); // Escalated
    setIsAiProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-xl h-full bg-[#111112] border-l border-zinc-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Task Details</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* AI Helper Bar */}
          <button 
            onClick={simulateAiUpdate}
            disabled={isAiProcessing}
            className="w-full p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between group hover:bg-indigo-500/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                {isAiProcessing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-indigo-400">Optimize with AI</p>
                <p className="text-xs text-zinc-500">Auto-prioritize and generate technical notes</p>
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-[10px] font-bold text-zinc-400 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
              BETA
            </div>
          </button>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Type size={12} /> Title
              </label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0c0c0d] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-lg font-medium"
                placeholder="Task title..."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Layout size={12} /> Project
                </label>
                <select 
                  value={projectId} 
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-[#0c0c0d] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-700"
                >
                  <option value="">No Project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <User size={12} /> Priority
                </label>
                <select 
                  value={priority} 
                  onChange={(e) => setPriority(parseInt(e.target.value))}
                  className="w-full bg-[#0c0c0d] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-700"
                >
                  <option value={1}>High</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare size={12} /> Status
                </label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-[#0c0c0d] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-700"
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={12} /> Due Date
                </label>
                <input 
                  type="date" 
                  className="w-full bg-[#0c0c0d] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-700 [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                Description & Notes
              </label>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                className="w-full bg-[#0c0c0d] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700 resize-none font-mono"
                placeholder="Enter technical details, requirements, or links..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 flex items-center justify-between gap-4">
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 text-rose-500 hover:text-rose-400 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <Trash2 size={16} />
            Delete
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-zinc-200 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
