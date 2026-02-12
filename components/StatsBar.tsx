
import React from 'react';
import { Task } from '../types';
import { Target, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

interface StatsBarProps {
  tasks: Task[];
}

const StatsBar: React.FC<StatsBarProps> = ({ tasks }) => {
  const stalledCount = tasks.filter(t => t.status === 'Stalled').length;
  const doneCount = tasks.filter(t => t.status === 'Done').length;
  const totalCount = tasks.length;
  const progressPercent = Math.round((doneCount / (totalCount || 1)) * 100);

  // Example DPC (Daily Progress Count or $ value) bar
  const currentDPC = 6250;
  const goalDPC = 10000;
  const dpcPercent = (currentDPC / goalDPC) * 100;

  return (
    <div className="px-6 py-4 flex flex-col md:flex-row gap-6 border-b border-zinc-900 bg-zinc-950/50">
      <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-stalled/10 flex items-center justify-center text-stalled">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase">Stalled Tasks</div>
            <div className="text-lg font-bold">{stalledCount}</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase">Completed</div>
            <div className="text-lg font-bold">{doneCount}</div>
          </div>
        </div>

        {/* Metric 3: Project Velocity/DPC */}
        <div className="col-span-2 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/50 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-accent" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase">$10k DPC Progress</span>
            </div>
            <span className="text-xs font-bold text-accent">${currentDPC.toLocaleString()}</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-accent to-indigo-400 transition-all duration-1000 ease-out"
              style={{ width: `${dpcPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
