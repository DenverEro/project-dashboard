import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { Task } from '../types';

// Transform snake_case from Supabase to camelCase for frontend
const transformTaskFromDB = (dbTask: any): Task => ({
  id: dbTask.id,
  title: dbTask.title,
  description: dbTask.description,
  status: dbTask.status,
  priority: dbTask.priority,
  projectId: dbTask.project_id,
  dueDate: dbTask.due_date,
  assignee: dbTask.assignee,
  stalledAt: dbTask.stalled_at,
  updatedAt: dbTask.updated_at
});

// Transform camelCase from frontend to snake_case for Supabase
const transformTaskToDB = (task: Partial<Task>): any => {
  const dbTask: any = {};
  if (task.title !== undefined) dbTask.title = task.title;
  if (task.description !== undefined) dbTask.description = task.description;
  if (task.status !== undefined) dbTask.status = task.status;
  if (task.priority !== undefined) dbTask.priority = task.priority;
  if (task.projectId !== undefined) dbTask.project_id = task.projectId;
  if (task.dueDate !== undefined) dbTask.due_date = task.dueDate;
  if (task.assignee !== undefined) dbTask.assignee = task.assignee;
  if (task.stalledAt !== undefined) dbTask.stalled_at = task.stalledAt;
  return dbTask;
};

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
      
      // Transform snake_case to camelCase
      const transformedTasks = (data || []).map(transformTaskFromDB);
      setTasks(transformedTasks);
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
      const dbTask = transformTaskToDB(task);
      
      const { data, error: supabaseError } = await supabase
        .from('tasks')
        .insert(dbTask)
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      
      const transformedTask = transformTaskFromDB(data);
      setTasks(prev => [transformedTask, ...prev]);
      return transformedTask;
    } catch (err) {
      console.error('Error inserting task:', err);
      setError('Failed to insert task');
      throw err;
    }
  }, []);

  // Update task
  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      const dbUpdates = transformTaskToDB(updates);
      dbUpdates.updated_at = new Date().toISOString();

      const { data, error: supabaseError } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      
      const transformedTask = transformTaskFromDB(data);
      setTasks(prev => prev.map(t => t.id === id ? transformedTask : t));
      return transformedTask;
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

  // Move task (for DnD) - upserts status with updated_at
  const moveTask = useCallback(async (taskId: string, newStatus: Task['status']) => {
    try {
      const now = new Date().toISOString();
      const updates = { 
        status: newStatus,
        stalled_at: newStatus === 'Stalled' ? now : null,
        updated_at: now
      };

      const { data, error: supabaseError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      
      const transformedTask = transformTaskFromDB(data);
      setTasks(prev => prev.map(t => t.id === taskId ? transformedTask : t));
      return transformedTask;
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

    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Task change received:', payload);
          fetchTasks();
        }
      )
      .subscribe((status) => {
        console.log('Tasks subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to tasks changes');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.error('Tasks subscription error or closed:', status);
        }
      });

    return () => {
      channel.unsubscribe();
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
