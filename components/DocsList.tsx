
import React from 'react';
import { Document, Project } from '../types';
import { Plus, FileText, LayoutTemplate, MessageSquare, BookOpen } from 'lucide-react';

interface DocsListProps {
  docs: Document[];
  projects: Project[];
}

const DocsList: React.FC<DocsListProps> = ({ docs, projects }) => {
  const getIcon = (type: Document['type']) => {
    switch (type) {
      case 'SOP': return <BookOpen size={16} className="text-blue-400" />;
      case 'Template': return <LayoutTemplate size={16} className="text-purple-400" />;
      case 'Notes': return <MessageSquare size={16} className="text-orange-400" />;
      default: return <FileText size={16} className="text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-500">{docs.length} documents</h3>
        <button className="flex items-center gap-2 bg-accent px-4 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all">
          <Plus size={16} />
          New Document
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-900">
              <th className="pb-3 px-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Title</th>
              <th className="pb-3 px-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Type</th>
              <th className="pb-3 px-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Project</th>
              <th className="pb-3 px-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider text-right">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {docs.map((doc) => {
              const project = projects.find(p => p.id === doc.projectId);
              return (
                <tr key={doc.id} className="group cursor-pointer hover:bg-zinc-900/40 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {getIcon(doc.type)}
                      <span className="text-sm font-medium group-hover:text-white transition-colors">{doc.title}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500">
                      {doc.type}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {project ? (
                      <div className="flex items-center gap-2">
                         <div className={`w-1.5 h-1.5 rounded-full bg-${project.color}-500`} />
                         <span className="text-xs text-zinc-400">{project.name}</span>
                      </div>
                    ) : (
                      <span className="text-zinc-700">—</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-xs text-zinc-500 text-right">
                    {new Date(doc.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocsList;
