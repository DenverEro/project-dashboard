
import { useState, useEffect, useCallback } from 'react';
import { Project, Task, Document } from './types';
import { INITIAL_PROJECTS, INITIAL_TASKS, INITIAL_DOCS } from './constants';
import { supabaseApi, isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_KEY = 'adhd_dashboard_data';

export const useStore = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(isSupabaseConfigured());

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setSyncError(null);

      try {
        if (isSupabaseConfigured()) {
          // Try to load from Supabase
          const [projectsData, tasksData, docsData] = await Promise.all([
            supabaseApi.getProjects(),
            supabaseApi.getTasks(),
            supabaseApi.getDocuments()
          ]);

          setProjects(projectsData.length > 0 ? projectsData : INITIAL_PROJECTS);
          setTasks(tasksData.length > 0 ? tasksData : INITIAL_TASKS);
          setDocs(docsData.length > 0 ? docsData : INITIAL_DOCS);
          setIsOnline(true);
        } else {
          // Fallback to localStorage
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
          setIsOnline(false);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setSyncError('Failed to load data from Supabase');
        // Fallback to localStorage
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
        setIsOnline(false);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Save to localStorage whenever data changes (always keep local backup)
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ projects, tasks, docs }));
    }
  }, [projects, tasks, docs, loading]);

  // Sync to Supabase helper
  const syncToSupabase = useCallback(async (operation: () => Promise<void>) => {
    if (!isSupabaseConfigured()) return;
    
    try {
      setSyncError(null);
      await operation();
    } catch (error) {
      console.error('Sync error:', error);
      setSyncError('Failed to sync with Supabase');
      setIsOnline(false);
    }
  }, []);

  // Project operations
  const updateProject = useCallback(async (updatedProj: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProj.id ? updatedProj : p));
    
    await syncToSupabase(async () => {
      await supabaseApi.updateProject(updatedProj.id, updatedProj);
    });
  }, [syncToSupabase]);

  const addProject = useCallback(async (project: Project) => {
    setProjects(prev => [...prev, project]);
    
    await syncToSupabase(async () => {
      await supabaseApi.createProject(project);
    });
  }, [syncToSupabase]);

  const deleteProject = useCallback(async (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    
    await syncToSupabase(async () => {
      await supabaseApi.deleteProject(id);
    });
  }, [syncToSupabase]);

  // Task operations
  const updateTask = useCallback(async (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    
    await syncToSupabase(async () => {
      await supabaseApi.updateTask(updatedTask.id, updatedTask);
    });
  }, [syncToSupabase]);

  const addTask = useCallback(async (task: Task) => {
    setTasks(prev => [...prev, task]);
    
    await syncToSupabase(async () => {
      await supabaseApi.createTask(task);
    });
  }, [syncToSupabase]);

  const deleteTask = useCallback(async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    
    await syncToSupabase(async () => {
      await supabaseApi.deleteTask(id);
    });
  }, [syncToSupabase]);

  const moveTask = useCallback(async (taskId: string, newStatus: Task['status']) => {
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
    
    await syncToSupabase(async () => {
      await supabaseApi.moveTask(taskId, newStatus);
    });
  }, [syncToSupabase]);

  // Document operations
  const updateDocument = useCallback(async (updatedDoc: Document) => {
    setDocs(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
    
    await syncToSupabase(async () => {
      await supabaseApi.updateDocument(updatedDoc.id, updatedDoc);
    });
  }, [syncToSupabase]);

  const addDocument = useCallback(async (doc: Document) => {
    setDocs(prev => [...prev, doc]);
    
    await syncToSupabase(async () => {
      await supabaseApi.createDocument(doc);
    });
  }, [syncToSupabase]);

  const deleteDocument = useCallback(async (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    
    await syncToSupabase(async () => {
      await supabaseApi.deleteDocument(id);
    });
  }, [syncToSupabase]);

  // Manual sync function (for OpenClaw integration)
  const syncAll = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setSyncError('Supabase not configured');
      return;
    }

    try {
      setSyncError(null);
      await supabaseApi.syncAll(projects, tasks, docs);
      setIsOnline(true);
    } catch (error) {
      console.error('Bulk sync error:', error);
      setSyncError('Failed to sync all data');
      setIsOnline(false);
    }
  }, [projects, tasks, docs]);

  // Refresh data from Supabase
  const refreshFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) return;

    try {
      setLoading(true);
      setSyncError(null);
      
      const [projectsData, tasksData, docsData] = await Promise.all([
        supabaseApi.getProjects(),
        supabaseApi.getTasks(),
        supabaseApi.getDocuments()
      ]);

      setProjects(projectsData.length > 0 ? projectsData : INITIAL_PROJECTS);
      setTasks(tasksData.length > 0 ? tasksData : INITIAL_TASKS);
      setDocs(docsData.length > 0 ? docsData : INITIAL_DOCS);
      setIsOnline(true);
    } catch (error) {
      console.error('Refresh error:', error);
      setSyncError('Failed to refresh from Supabase');
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    projects, 
    tasks, 
    docs, 
    loading,
    isOnline,
    syncError,
    updateTask, 
    addTask, 
    deleteTask, 
    moveTask, 
    updateProject,
    addProject,
    deleteProject,
    updateDocument,
    addDocument,
    deleteDocument,
    syncAll,
    refreshFromSupabase
  };
};

export default useStore;
