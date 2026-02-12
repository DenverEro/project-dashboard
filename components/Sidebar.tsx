
import React from 'react';
import { LayoutDashboard, FolderKanban, FileText, Settings, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isOpen, onToggle }) => {
  const items: { label: View; icon: React.ReactNode }[] = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Projects', icon: <FolderKanban size={20} /> },
    { label: 'Documents', icon: <FileText size={20} /> },
  ];

  return (
    <aside 
      className={`bg-zinc-950 border-r border-zinc-900 transition-all duration-300 flex flex-col relative z-40
        ${isOpen ? 'w-64' : 'w-20'} 
        md:static absolute h-full ${!isOpen ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
      `}
    >
      <div className="h-14 flex items-center px-6 border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-accent rounded-sm flex-shrink-0" />
          {isOpen && <span className="font-bold text-lg tracking-tight">FocusFlow</span>}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => onViewChange(item.label)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
              ${currentView === item.label 
                ? 'bg-zinc-900 text-white shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}
            `}
          >
            <span className={currentView === item.label ? 'text-accent' : ''}>
              {item.icon}
            </span>
            {isOpen && <span className="text-sm font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-zinc-900 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-zinc-300 transition-colors">
          <Settings size={20} />
          {isOpen && <span className="text-sm">Settings</span>}
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-zinc-300 transition-colors">
          <HelpCircle size={20} />
          {isOpen && <span className="text-sm">Help & Support</span>}
        </button>
      </div>

      {/* Collapse button for desktop */}
      <button 
        onClick={onToggle}
        className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-zinc-900 border border-zinc-800 rounded-full items-center justify-center text-zinc-500 hover:text-white shadow-xl z-50"
      >
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>
    </aside>
  );
};

export default Sidebar;
