import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { Project } from '../types';

// Transform snake_case from Supabase to camelCase for frontend
const transformProjectFromDB = (dbProject: any): Project => ({
  id: dbProject.id,
  name: dbProject.name,
  description: dbProject.description,
  status: dbProject.status,
  type: dbProject.type,
  color: dbProject.color,
  taskCount: dbProject.task_count,
  createdAt: dbProject.created_at
});

// Transform camelCase from frontend to snake_case for Supabase
const transformProjectToDB = (project: Partial<Project>): any => {
  const dbProject: any = {};
  if (project.name !== undefined) dbProject.name = project.name;
  if (project.description !== undefined) dbProject.description = project.description;
  if (project.status !== undefined) dbProject.status = project.status;
  if (project.type !== undefined) dbProject.type = project.type;
  if (project.color !== undefined) dbProject.color = project.color;
  if (project.taskCount !== undefined) dbProject.task_count = project.taskCount;
  return dbProject;
};

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      
      // Transform snake_case to camelCase
      const transformedProjects = (data || []).map(transformProjectFromDB);
      setProjects(transformedProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  // Insert project
  const insertProject = useCallback(async (project: Omit<Project, 'id'>) => {
    try {
      const dbProject = transformProjectToDB(project);
      
      const { data, error: supabaseError } = await supabase
        .from('projects')
        .insert(dbProject)
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      
      const transformedProject = transformProjectFromDB(data);
      setProjects(prev => [transformedProject, ...prev]);
      return transformedProject;
    } catch (err) {
      console.error('Error inserting project:', err);
      setError('Failed to insert project');
      throw err;
    }
  }, []);

  // Update project
  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    try {
      const dbUpdates = transformProjectToDB(updates);
      dbUpdates.updated_at = new Date().toISOString();

      const { data, error: supabaseError } = await supabase
        .from('projects')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      
      const transformedProject = transformProjectFromDB(data);
      setProjects(prev => prev.map(p => p.id === id ? transformedProject : p));
      return transformedProject;
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Failed to update project');
      throw err;
    }
  }, []);

  // Delete project
  const deleteProject = useCallback(async (id: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (supabaseError) throw supabaseError;
      
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project');
      throw err;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Realtime subscription
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('projects-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'projects' },
        (payload) => {
          console.log('Project change received:', payload);
          fetchProjects();
        }
      )
      .subscribe((status) => {
        console.log('Projects subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to projects changes');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.error('Projects subscription error or closed:', status);
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    insertProject,
    updateProject,
    deleteProject
  };
};

export default useProjects;
