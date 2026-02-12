import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { Task } from '../types';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  // Insert task
  const insertTask = useCallback(async (task: Omit<Task, 'id'>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      
      setTasks(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error inserting task:', err);
      setError('Failed to insert task');
      throw err;
    }
  }, []);

  // Update task
  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      
      setTasks(prev => prev.map(t => t.id === id ? data : t));
      return data;
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
      throw err;
    }
  }, []);

  // Delete task
  const deleteTask = useCallback(async (id: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (supabaseError) throw supabaseError;
      
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
      throw err;
    }
  }, []);

  // Move task (for DnD) - upserts status
  const moveTask = useCallback(async (taskId: string, newStatus: Task['status']) => {
    try {
      const updates = { 
        status: newStatus,
        stalled_at: newStatus === 'Stalled' ? new Date().toISOString() : null,
        last_updated: new Date().toISOString()
      };

      const { data, error: supabaseError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
      return data;
    } catch (err) {
      console.error('Error moving task:', err);
      setError('Failed to move task');
      throw err;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Realtime subscription
  useEffect(() => {
    if (!supabase) return;

    const subscription = supabase
      .channel('tasks-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Task change received:', payload);
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    insertTask,
    updateTask,
    deleteTask,
    moveTask
  };
};

export default useTasks;
