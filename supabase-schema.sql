-- Supabase Schema for FocusFlow Dashboard
-- Run this in Supabase SQL Editor

-- Enable Row Level Security (RLS) - required for production
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret';

-- Create Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Active',
  type TEXT DEFAULT 'Internal',
  color TEXT DEFAULT 'indigo',
  task_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Todo',
  priority TEXT DEFAULT 'Medium',
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  due_date DATE,
  assignee TEXT DEFAULT 'AC',
  stalled_at TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT DEFAULT 'Notes',
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  content TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);

-- Enable Realtime for all tables
BEGIN;
  -- Drop existing publication if it exists
  DROP PUBLICATION IF EXISTS supabase_realtime;
  
  -- Create new publication
  CREATE PUBLICATION supabase_realtime;
  
  -- Add tables to publication
  ALTER PUBLICATION supabase_realtime ADD TABLE projects;
  ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
  ALTER PUBLICATION supabase_realtime ADD TABLE documents;
COMMIT;

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for authenticated users)
-- For development: allow all operations
CREATE POLICY "Allow all operations" ON projects
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations" ON tasks
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations" ON documents
  FOR ALL USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
-- Uncomment if you want to start with sample data

/*
INSERT INTO projects (name, description, status, type, color, task_count) VALUES
  ('DPC', 'Deploy Hostinger project', 'Paused', 'Internal', 'indigo', 12),
  ('Nanobot', 'Self-host Gmail replacement', 'Active', 'Internal', 'orange', 8),
  ('OpenClaw-Unify', '5 to 1 LLM gateway', 'Active', 'Agency', 'emerald', 5),
  ('Boringbest', 'Affiliate engine', 'Active', 'Content', 'pink', 3),
  ('Tetris-Task-Game', 'Gamified task management', 'Active', 'Content', 'purple', 15),
  ('Stardew-Farm-Manager', 'Switch farm automation', 'Active', 'Internal', 'blue', 2),
  ('Dashboard', 'This specific tool', 'Active', 'Internal', 'cyan', 20);

INSERT INTO tasks (title, description, status, priority, project_id, due_date, assignee) VALUES
  ('DPC audit', 'Full system audit for stalled project', 'Stalled', 'High', (SELECT id FROM projects WHERE name = 'DPC'), '2026-02-10', 'AC'),
  ('Vercel live', 'Push main branch to production', 'Todo', 'Critical', (SELECT id FROM projects WHERE name = 'DPC'), '2026-02-15', 'AC'),
  ('Design new landing page', 'Hero section and feature grid', 'Todo', 'High', (SELECT id FROM projects WHERE name = 'OpenClaw-Unify'), '2026-02-10', 'AC'),
  ('Implement authentication', 'Clerk integration for user auth', 'In Progress', 'High', (SELECT id FROM projects WHERE name = 'Nanobot'), '2026-02-08', 'SK');

INSERT INTO documents (title, type, project_id) VALUES
  ('Deployment Process', 'SOP', (SELECT id FROM projects WHERE name = 'Nanobot')),
  ('API Reference', 'Reference', (SELECT id FROM projects WHERE name = 'OpenClaw-Unify'));
*/
