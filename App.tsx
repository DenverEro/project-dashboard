import React, { useState, useEffect } from 'react';
import { View, Task, Project } from './types';
import Sidebar from './components/Sidebar';
import KanbanBoard from './components/KanbanBoard';
import TaskList from './components/TaskList';
import ProjectsTable from './components/ProjectsTable';
import DocsList from './components/DocsList';
import StatsBar from './components/StatsBar';
import DetailPanel from './components/DetailPanel';
import { Search, Bell, Menu, LayoutGrid, List } from 'lucide-react';
import WeatherWidget from './components/WeatherWidget';
import DateTimeDisplay from './components/DateTimeDisplay';
import { useProjects, useTasks, useDocs } from './hooks';

const MOBILE_BREAKPOINT = 1024;

const App: React.FC = () => {
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading, insertTask, updateTask, deleteTask, moveTask } = useTasks();
  const { docs, loading: docsLoading } = useDocs();
  
  const [currentView, setCurrentView] = useState<View>('Dashboard');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [forceListView, setForceListView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAddTask = async (status: Task['status']) => {
    const newTask = {
      title: 'New Task',
      description: '',
      status: status,
      priority: 'Medium' as const,
      project_id: projects[0]?.id || '',
      due_date: new Date().toISOString().split('T')[0],
      assignee: 'AC'
    };

    try {
      const created = await insertTask(newTask);
      setSelectedTask(created);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleSaveTask = async (data: Task) => {
    try {
      // Pass camelCase data - the hook will transform to snake_case
      const taskData = {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        projectId: data.projectId,
        dueDate: data.dueDate,
        assignee: data.assignee,
        stalledAt: data.stalledAt
      };

      if (tasks.find(t => t.id === data.id)) {
        await updateTask(data.id, taskData);
      } else {
        await insertTask(taskData);
      }
      setSelectedTask(null);
    } catch (err) {
      console.error('Failed to save task:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      setSelectedTask(null);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const renderContent = () => {
    if (projectsLoading || tasksLoading || docsLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-zinc-500">Loading...</div>
        </div>
      );
    }

    switch (currentView) {
      case 'Dashboard':
        const showListView = isMobile || forceListView;
        return showListView ? (
          <TaskList 
            tasks={tasks} 
            projects={projects} 
            onTaskClick={setSelectedTask}
            onAddTask={handleAddTask}
          />
        ) : (
          <KanbanBoard 
            tasks={tasks} 
            projects={projects} 
            onTaskClick={setSelectedTask} 
            onMoveTask={moveTask}
            onAddTask={handleAddTask}
          />
        );
      case 'Projects':
        return <ProjectsTable 
          projects={projects} 
          onProjectClick={setSelectedProject} 
        />;
      case 'Documents':
        return <DocsList docs={docs} projects={projects} />;
      default:
        return <div>View not implemented</div>;
    }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden font-sans">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-zinc-900 flex items-center justify-between px-6 bg-black/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="lg:hidden p-2 text-zinc-400 hover:text-white"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold tracking-tight">{currentView}</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            <DateTimeDisplay />
            <WeatherWidget />
          </div>
          
          <div className="flex items-center gap-3">
            {currentView === 'Dashboard' && !isMobile && (
              <div className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                <button
                  onClick={() => setForceListView(false)}
                  className={`p-1.5 rounded transition-colors ${!forceListView ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                  title="Board View"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setForceListView(true)}
                  className={`p-1.5 rounded transition-colors ${forceListView ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                  title="List View"
                >
                  <List size={16} />
                </button>
              </div>
            )}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type="text" 
                placeholder="Search everything..." 
                className="bg-zinc-900/50 border border-zinc-800 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-accent w-64 transition-all"
              />
            </div>
            <button className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-900 transition-colors">
              <Bell size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-accent/20">
              AC
            </div>
          </div>
        </header>

        {currentView === 'Dashboard' && <StatsBar tasks={tasks} />}

        <div className="flex-1 overflow-auto bg-black p-6">
          {renderContent()}
        </div>
      </main>

      <DetailPanel 
        type="task"
        isOpen={!!selectedTask} 
        data={selectedTask} 
        projects={projects}
        onClose={() => setSelectedTask(null)} 
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      <DetailPanel 
        type="project"
        isOpen={!!selectedProject} 
        data={selectedProject} 
        projects={projects}
        onClose={() => setSelectedProject(null)} 
        onSave={(data) => {
          setSelectedProject(null);
        }}
        onDelete={() => setSelectedProject(null)}
      />
    </div>
  );
};

export default App;
