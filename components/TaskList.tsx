import React from 'react';
import { Task, Project, Status } from '../types';
import { Calendar, AlertCircle, GripVertical } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: Status) => void;
}

const STATUS_ORDER: Status[] = ['Todo', 'In Progress', 'Done', 'Stalled'];

const TaskList: React.FC<TaskListProps> = ({ tasks, projects, onTaskClick, onAddTask }) => {
  const getProject = (projectId: string) => projects.find(p => p.id === projectId);

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'Todo': return 'bg-zinc-800 text-zinc-400';
      case 'In Progress': return 'bg-blue-900/30 text-blue-400';
      case 'Done': return 'bg-emerald-900/30 text-emerald-400';
      case 'Stalled': return 'bg-red-900/30 text-red-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-blue-500';
      case 'Low': return 'bg-zinc-500';
      default: return 'bg-zinc-500';
    }
  };

  // Group tasks by status
  const groupedTasks = STATUS_ORDER.map(status => ({
    status,
    tasks: tasks.filter(t => t.status === status)
  })).filter(group => group.tasks.length > 0);

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
        <p className="text-sm">No tasks yet</p>
        <button 
          onClick={() => onAddTask('Todo')}
          className="mt-4 text-accent text-sm font-medium"
        >
          Create your first task
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedTasks.map(({ status, tasks: statusTasks }) => (
        <div key={status} className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{status}</h3>
              <span className="text-[10px] font-bold bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full">
                {statusTasks.length}
              </span>
            </div>
            <button 
              onClick={() => onAddTask(status)}
              className="text-xs text-accent font-medium"
            >
              + Add
            </button>
          </div>

          <div className="space-y-2">
            {statusTasks.map((task) => {
              const project = getProject(task.projectId);
              const isStalledLong = task.status === 'Stalled' && task.stalledAt && 
                (new Date().getTime() - new Date(task.stalledAt).getTime() > 86400000);

              return (
                <div
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className={`bg-zinc-900 border border-zinc-800 rounded-xl p-4 active:scale-[0.98] transition-transform ${
                    isStalledLong ? 'border-l-4 border-l-red-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-white truncate">{task.title || 'Untitled Task'}</h4>
                        {isStalledLong && <AlertCircle size={14} className="text-red-500 flex-shrink-0" />}
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{task.description}</p>
                      )}

                      <div className="flex items-center gap-3 mt-3">
                        {project && (
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full bg-${project.color}-500`} />
                            <span className="text-[10px] text-zinc-400">{project.name}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 text-zinc-500">
                          <Calendar size={10} />
                          <span className="text-[10px]">
                            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${getStatusColor(task.status)}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>

                    <div className="text-zinc-600">
                      <GripVertical size={16} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
