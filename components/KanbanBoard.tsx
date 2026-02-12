import React from 'react';
import { Task, Project, Status } from '../types';
import TaskCard from './TaskCard';
import { Plus, MoreVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface KanbanBoardProps {
  tasks: Task[];
  projects: Project[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: Status) => void;
  onMoveTask: (taskId: string, newStatus: Status) => void;
}

const COLUMNS: { label: Status; color: string }[] = [
  { label: 'Todo', color: 'zinc' },
  { label: 'In Progress', color: 'blue' },
  { label: 'Done', color: 'emerald' },
  { label: 'Stalled', color: 'stalled' },
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, projects, onTaskClick, onAddTask, onMoveTask }) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as Status;
    
    onMoveTask(draggableId, newStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-6 h-full min-h-[600px]">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.label);
          
          return (
            <div key={col.label} className="flex-shrink-0 w-80 flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm tracking-wide text-zinc-400 uppercase">
                    {col.label}
                  </h3>
                  <span className="text-[10px] font-bold bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => onAddTask(col.label)} className="p-1 hover:bg-zinc-800 rounded text-zinc-500 transition-colors">
                    <Plus size={16} />
                  </button>
                  <button className="p-1 hover:bg-zinc-800 rounded text-zinc-500 transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              <Droppable droppableId={col.label}>
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 flex flex-col gap-3 p-2 rounded-xl border-t-2 transition-colors ${
                      col.label === 'Stalled' ? 'border-stalled/50' : 
                      col.label === 'In Progress' ? 'border-blue-500/50' : 
                      col.label === 'Done' ? 'border-emerald-500/50' : 'border-zinc-800/50'
                    } ${snapshot.isDraggingOver ? 'bg-zinc-900/40' : 'bg-zinc-900/20'}`}
                  >
                    {colTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                            }}
                            className={snapshot.isDragging ? 'opacity-50 rotate-2' : ''}
                          >
                            <TaskCard 
                              task={task} 
                              project={projects.find(p => p.id === task.projectId)} 
                              onClick={() => onTaskClick(task)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    <button 
                      onClick={() => onAddTask(col.label)}
                      className="w-full py-2 flex items-center justify-center gap-2 text-zinc-500 text-xs hover:text-zinc-300 hover:bg-zinc-900/40 rounded-lg border border-dashed border-zinc-800 transition-all group"
                    >
                      <Plus size={14} className="group-hover:scale-110 transition-transform" />
                      Add task
                    </button>
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
