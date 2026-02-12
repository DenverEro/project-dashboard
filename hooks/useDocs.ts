import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { Document } from '../types';

// Transform snake_case from Supabase to camelCase for frontend
const transformDocFromDB = (dbDoc: any): Document => ({
  id: dbDoc.id,
  title: dbDoc.title,
  type: dbDoc.type,
  projectId: dbDoc.project_id,
  content: dbDoc.content,
  updatedAt: dbDoc.updated_at
});

// Transform camelCase from frontend to snake_case for Supabase
const transformDocToDB = (doc: Partial<Document>): any => {
  const dbDoc: any = {};
  if (doc.title !== undefined) dbDoc.title = doc.title;
  if (doc.type !== undefined) dbDoc.type = doc.type;
  if (doc.projectId !== undefined) dbDoc.project_id = doc.projectId;
  if (doc.content !== undefined) dbDoc.content = doc.content;
  return dbDoc;
};

export const useDocs = () => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch documents
  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      
      // Transform snake_case to camelCase
      const transformedDocs = (data || []).map(transformDocFromDB);
      setDocs(transformedDocs);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, []);

  // Insert document
  const insertDoc = useCallback(async (doc: Omit<Document, 'id'>) => {
    try {
      const dbDoc = transformDocToDB(doc);
      
      const { data, error: supabaseError } = await supabase
        .from('documents')
        .insert(dbDoc)
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      
      const transformedDoc = transformDocFromDB(data);
      setDocs(prev => [transformedDoc, ...prev]);
      return transformedDoc;
    } catch (err) {
      console.error('Error inserting document:', err);
      setError('Failed to insert document');
      throw err;
    }
  }, []);

  // Update document
  const updateDoc = useCallback(async (id: string, updates: Partial<Document>) => {
    try {
      const dbUpdates = transformDocToDB(updates);
      dbUpdates.updated_at = new Date().toISOString();

      const { data, error: supabaseError } = await supabase
        .from('documents')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      
      const transformedDoc = transformDocFromDB(data);
      setDocs(prev => prev.map(d => d.id === id ? transformedDoc : d));
      return transformedDoc;
    } catch (err) {
      console.error('Error updating document:', err);
      setError('Failed to update document');
      throw err;
    }
  }, []);

  // Delete document
  const deleteDoc = useCallback(async (id: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (supabaseError) throw supabaseError;
      
      setDocs(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document');
      throw err;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  // Realtime subscription
  useEffect(() => {
    if (!supabase) return;

    const subscription = supabase
      .channel('documents-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'documents' },
        (payload) => {
          console.log('Document change received:', payload);
          fetchDocs();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchDocs]);

  return {
    docs,
    loading,
    error,
    fetchDocs,
    insertDoc,
    updateDoc,
    deleteDoc
  };
};

export default useDocs;
