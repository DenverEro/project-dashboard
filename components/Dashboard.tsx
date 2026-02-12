
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { Task, Project, Status } from '../types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Search, Plus, Calendar, Filter, MoreHorizontal, AlertCircle } from 'lucide-react';
import TaskModal from './TaskModal';

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: projectData } = await supabase.from('projects').select('*');
    const { data: taskData } = await supabase.from('tasks').select('*, projects(*)').order('priority', { ascending: true });
    
    if (projectData) setProjects(projectData);
    if (taskData) {
      // Manual project mapping if needed
      setTasks(taskData.map(t => ({ ...t, project: t.projects })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    // Set up realtime subscription
    const channel = supabase.channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as Status;
    
    // Optimistic update
    const updatedTasks = tasks.map(t => t.id === draggableId ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);

    // Persist to Supabase
    await supabase.from('tasks').update({ status: newStatus }).eq('id', draggableId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Todo': return 'bg-zinc-800 text-zinc-300';
      case 'In Progress': return 'bg-blue-500/10 text-blue-400';
      case 'Done': return 'bg-emerald-500/10 text-emerald-400';
      default: return 'bg-zinc-800 text-zinc-300';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-rose-500';
      case 2: return 'bg-amber-500';
      case 3: return 'bg-blue-500';
      default: return 'bg-zinc-500';
    }
  };

  const openTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const addTask = async (status: Status) => {
    const { data, error } = await supabase.from('tasks').insert({
      title: 'New Task',
      status: status,
      priority: 2,
      project_id: projects[0]?.id
    }).select('*, projects(*)').single();

    if (data) {
      const newTask = { ...data, project: data.projects };
      setTasks([...tasks, newTask]);
      openTask(newTask);
    }
  };

  const columns: Status[] = ['Todo', 'In Progress', 'Done'];

  // Metrics calculation
  const stalledProjects = projects.filter(p => p.status === 'Stalled').length;
  const stalledValue = stalledProjects * 1000; // Fake metric: each stalled project costs $1k

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">Overview of your active tasks and team performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-zinc-300" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="bg-zinc-900/50 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700 w-64 transition-all"
            />
          </div>
          <button className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </header>

      {/* Stalled Metrics Bar */}
      <div className="mb-8 p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-500" />
            <span className="text-sm font-medium text-zinc-300">Stalled Metrics</span>
          </div>
          <span className="text-xs text-zinc-500">{stalledProjects} projects delayed</span>
        </div>
        <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-rose-500 transition-all duration-1000 ease-out"
            style={{ width: `${Math.min((stalledValue / 10000) * 100, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-zinc-600 font-mono tracking-wider">$0</span>
          <span className="text-[10px] text-rose-500/70 font-mono tracking-wider">${stalledValue.toLocaleString()} in potential delays</span>
          <span className="text-[10px] text-zinc-600 font-mono tracking-wider">$10,000</span>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(status => (
            <Droppable key={status} droppableId={status}>
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="bg-transparent rounded-lg flex flex-col min-h-[500px]"
                >
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">{status}</h2>
                      <span className="bg-zinc-900 text-zinc-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-zinc-800">
                        {tasks.filter(t => t.status === status).length}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {tasks
                      .filter(t => t.status === status)
                      .map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => openTask(task)}
                              className={`bg-[#161617] border border-zinc-800 p-4 rounded-xl group hover:border-zinc-700 transition-all cursor-pointer ${snapshot.isDragging ? 'shadow-2xl shadow-black/50 ring-1 ring-zinc-600' : ''}`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                                  <h3 className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors truncate pr-2">{task.title}</h3>
                                </div>
                                <MoreHorizontal size={14} className="text-zinc-600 opacity-0 group-hover:opacity-100" />
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mb-3">
                                {task.project && (
                                  <span className={`text-[10px] px-2 py-0.5 rounded border border-zinc-800/50 bg-zinc-900 text-zinc-400`}>
                                    {task.project.name}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-zinc-500">
                                  <Calendar size={12} />
                                  <span className="text-[10px] font-medium">
                                    {task.due ? new Date(task.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}
                                  </span>
                                </div>
                                <div className="flex -space-x-1.5">
                                  <div className="w-5 h-5 rounded-full bg-zinc-800 border-2 border-[#161617] flex items-center justify-center text-[8px] font-bold text-zinc-400">
                                    AC
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    <button 
                      onClick={() => addTask(status)}
                      className="w-full py-2.5 flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl transition-all text-xs font-medium"
                    >
                      <Plus size={14} />
                      Add Task
                    </button>
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {selectedTask && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          task={selectedTask}
          projects={projects}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
};

export default Dashboard;
