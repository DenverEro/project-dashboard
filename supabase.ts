import { createClient } from '@supabase/supabase-js';
import { Project, Task, Document } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return !!supabaseUrl && !!supabaseAnonKey;
};

export const supabase = isSupabaseConfigured() 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// REST API wrappers for OpenClaw integration
export const supabaseApi = {
  // Projects
  async getProjects(): Promise<Project[]> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteProject(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Tasks
  async getTasks(): Promise<Task[]> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteTask(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async moveTask(id: string, newStatus: Task['status']): Promise<Task> {
    if (!supabase) throw new Error('Supabase not configured');
    const updates: Partial<Task> = { 
      status: newStatus,
      stalledAt: newStatus === 'Stalled' ? new Date().toISOString() : undefined
    };
    
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Documents
  async getDocuments(): Promise<Document[]> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createDocument(doc: Omit<Document, 'id'>): Promise<Document> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('documents')
      .insert(doc)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteDocument(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Bulk operations for sync
  async syncAll(projects: Project[], tasks: Task[], documents: Document[]): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    // This is a simplified sync - in production, you'd want more sophisticated conflict resolution
    const { error: projectsError } = await supabase
      .from('projects')
      .upsert(projects);
    
    if (projectsError) throw projectsError;
    
    const { error: tasksError } = await supabase
      .from('tasks')
      .upsert(tasks);
    
    if (tasksError) throw tasksError;
    
    const { error: docsError } = await supabase
      .from('documents')
      .upsert(documents);
    
    if (docsError) throw docsError;
  },

  // Real-time subscriptions
  subscribeToProjects(callback: (payload: any) => void) {
    if (!supabase) return null;
    return supabase
      .channel('projects-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, callback)
      .subscribe();
  },

  subscribeToTasks(callback: (payload: any) => void) {
    if (!supabase) return null;
    return supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, callback)
      .subscribe();
  },

  subscribeToDocuments(callback: (payload: any) => void) {
    if (!supabase) return null;
    return supabase
      .channel('documents-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, callback)
      .subscribe();
  }
};

export default supabaseApi;
