
import { useState, useEffect } from 'react';
// Fix: Import types from their source types.ts and initial data from constants.tsx
import { Project, Task, Document } from './types';
import { INITIAL_PROJECTS, INITIAL_TASKS, INITIAL_DOCS } from './constants';

const LOCAL_STORAGE_KEY = 'adhd_dashboard_data';

export const useStore = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setProjects(parsed.projects || INITIAL_PROJECTS);
      setTasks(parsed.tasks || INITIAL_TASKS);
      setDocs(parsed.docs || INITIAL_DOCS);
    } else {
      setProjects(INITIAL_PROJECTS);
      setTasks(INITIAL_TASKS);
      setDocs(INITIAL_DOCS);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ projects, tasks, docs }));
    }
  }, [projects, tasks, docs, loading]);

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const moveTask = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          stalledAt: newStatus === 'Stalled' ? new Date().toISOString() : undefined,
          lastUpdated: new Date().toISOString()
        };
      }
      return t;
    }));
  };

  const updateProject = (updatedProj: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProj.id ? updatedProj : p));
  };

  return { projects, tasks, docs, updateTask, addTask, deleteTask, moveTask, updateProject };
};
