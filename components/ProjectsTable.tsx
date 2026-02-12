import React from 'react';
import { Project, Task } from '../types';
import { Plus, MoreHorizontal } from 'lucide-react';

interface ProjectsTableProps {
  projects: Project[];
  tasks: Task[];
  onProjectClick: (p: Project) => void;
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({ projects, tasks, onProjectClick }) => {
  // Calculate actual task count for each project
  const getTaskCount = (projectId: string) => {
    return tasks.filter(task => task.projectId === projectId).length;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-500">{projects.length} projects</h3>
        <button className="flex items-center gap-2 bg-accent px-4 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all">
          <Plus size={16} />
          New Project
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-900">
              <th className="pb-3 px-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Name</th>
              <th className="pb-3 px-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="pb-3 px-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Type</th>
              <th className="pb-3 px-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Tasks</th>
              <th className="pb-3 px-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {projects.map((proj) => (
              <tr 
                key={proj.id} 
                onClick={() => onProjectClick(proj)}
                className="group cursor-pointer hover:bg-zinc-900/40 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full bg-${proj.color}-500 shadow-[0_0_8px_rgba(var(--tw-color-${proj.color}-500),0.5)]`} />
                    <span className="text-sm font-medium group-hover:text-white transition-colors">{proj.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    proj.status === 'Active' ? 'bg-emerald-900/30 text-emerald-400' :
                    proj.status === 'Paused' ? 'bg-orange-900/30 text-orange-400' :
                    'bg-zinc-800 text-zinc-400'
                  }`}>
                    {proj.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-xs text-zinc-400">{proj.type}</td>
                <td className="py-4 px-4 text-xs text-zinc-400">{getTaskCount(proj.id)}</td>
                <td className="py-4 px-4 text-xs text-zinc-500 text-right">
                  {new Date(proj.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectsTable;
