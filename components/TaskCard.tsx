
import React from 'react';
import { Task, Project } from '../types';
import { Calendar, AlertCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  project?: Project;
  onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, project, onClick }) => {
  const isStalledLong = task.status === 'Stalled' && task.stalledAt && (new Date().getTime() - new Date(task.stalledAt).getTime() > 86400000);

  const priorityColors = {
    Low: 'bg-zinc-800 text-zinc-400',
    Medium: 'bg-blue-900/30 text-blue-400',
    High: 'bg-orange-900/30 text-orange-400',
    Critical: 'bg-red-900/30 text-red-400',
  };

  return (
    <div 
      onClick={onClick}
      className={`group bg-zinc-900 border border-zinc-800 p-4 rounded-xl cursor-pointer hover:border-zinc-700 hover:bg-zinc-800/80 transition-all shadow-sm active:scale-[0.98] ${
        isStalledLong ? 'border-l-4 border-l-stalled ring-1 ring-stalled/20' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isStalledLong ? 'bg-stalled animate-pulse' : (task.priority === 'Critical' ? 'bg-red-500' : 'bg-zinc-700')}`} />
          <h4 className="text-sm font-medium leading-snug group-hover:text-white transition-colors">
            {task.title || 'Untitled Task'}
          </h4>
        </div>
        {isStalledLong && (
          <AlertCircle size={14} className="text-stalled flex-shrink-0" />
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {project && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800/50 text-zinc-500 border border-zinc-700">
            {project.name}
          </span>
        )}
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-500">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}</span>
        </div>
        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 text-[9px] font-bold uppercase tracking-tighter">
          {task.assignee}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
