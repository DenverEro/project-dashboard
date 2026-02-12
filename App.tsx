
import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import { View, Task, Project } from './types';
import Sidebar from './components/Sidebar';
import KanbanBoard from './components/KanbanBoard';
import TaskList from './components/TaskList';
import ProjectsTable from './components/ProjectsTable';
import DocsList from './components/DocsList';
import StatsBar from './components/StatsBar';
import DetailPanel from './components/DetailPanel';
import { Search, Bell, Plus, Menu, LayoutGrid, List } from 'lucide-react';
import WeatherWidget from './components/WeatherWidget';
import DateTimeDisplay from './components/DateTimeDisplay';

const MOBILE_BREAKPOINT = 1024;

const App: React.FC = () => {
  const store = useStore();
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

  const renderContent = () => {
    switch (currentView) {
      case 'Dashboard':
        const showListView = isMobile || forceListView;
        return showListView ? (
          <TaskList 
            tasks={store.tasks} 
            projects={store.projects} 
            onTaskClick={setSelectedTask}
            onAddTask={(status) => setSelectedTask({
              id: Math.random().toString(36).substr(2, 9),
              title: '',
              description: '',
              status: status,
              priority: 'Medium',
              projectId: store.projects[0]?.id || '',
              dueDate: new Date().toISOString().split('T')[0],
              assignee: 'AC',
              lastUpdated: new Date().toISOString()
            })}
          />
        ) : (
          <KanbanBoard 
            tasks={store.tasks} 
            projects={store.projects} 
            onTaskClick={setSelectedTask} 
            onMoveTask={store.moveTask}
            onAddTask={(status) => setSelectedTask({
              id: Math.random().toString(36).substr(2, 9),
              title: '',
              description: '',
              status: status,
              priority: 'Medium',
              projectId: store.projects[0]?.id || '',
              dueDate: new Date().toISOString().split('T')[0],
              assignee: 'AC',
              lastUpdated: new Date().toISOString()
            })}
          />
        );
      case 'Projects':
        return <ProjectsTable 
          projects={store.projects} 
          onProjectClick={setSelectedProject} 
        />;
      case 'Documents':
        return <DocsList docs={store.docs} projects={store.projects} />;
      default:
        return <div>View not implemented</div>;
    }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
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
          
          {/* Date/Time and Weather - Center */}
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

        {/* Dashboard Metrics Bar */}
        {currentView === 'Dashboard' && <StatsBar tasks={store.tasks} />}

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-black p-6">
          {renderContent()}
        </div>
      </main>

      {/* Side Detail Panels (Slide out) */}
      <DetailPanel 
        type="task"
        isOpen={!!selectedTask} 
        data={selectedTask} 
        projects={store.projects}
        onClose={() => setSelectedTask(null)} 
        onSave={(data) => {
          if (store.tasks.find(t => t.id === data.id)) {
            store.updateTask(data as Task);
          } else {
            store.addTask(data as Task);
          }
          setSelectedTask(null);
        }}
        onDelete={(id) => {
          store.deleteTask(id);
          setSelectedTask(null);
        }}
      />

      <DetailPanel 
        type="project"
        isOpen={!!selectedProject} 
        data={selectedProject} 
        projects={store.projects}
        onClose={() => setSelectedProject(null)} 
        onSave={(data) => {
          store.updateProject(data as Project);
          setSelectedProject(null);
        }}
        onDelete={() => setSelectedProject(null)}
      />
    </div>
  );
};

export default App;
