
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, FileText, Share2, PanelLeftClose, PanelLeft } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Content', path: '/content', icon: Share2 },
    { name: 'Documents', path: '/documents', icon: FileText },
  ];

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-16'} bg-[#111112] border-r border-zinc-800/50 flex flex-col transition-all duration-300 h-full z-30`}>
      <div className="p-4 flex items-center justify-between">
        {isOpen && <h1 className="text-xl font-bold tracking-tight text-white">Planify</h1>}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400"
          title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 mt-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-zinc-800 text-white font-medium' 
                  : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
              }`
            }
          >
            <item.icon size={20} className="min-w-[20px]" />
            {isOpen && <span className="ml-3 truncate">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
            JD
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">John Doe</p>
              <p className="text-xs text-zinc-500 truncate">Pro Account</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
