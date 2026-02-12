import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { Project } from '../types';

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
      
      setProjects(data || []);
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
      const { data, error: supabaseError } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      
      setProjects(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error inserting project:', err);
      setError('Failed to insert project');
      throw err;
    }
  }, []);

  // Update project
  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    try {
      const updatesWithTimestamp = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error: supabaseError } = await supabase
        .from('projects')
        .update(updatesWithTimestamp)
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      
      setProjects(prev => prev.map(p => p.id === id ? data : p));
      return data;
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

    const subscription = supabase
      .channel('projects-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'projects' },
        (payload) => {
          console.log('Project change received:', payload);
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
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
