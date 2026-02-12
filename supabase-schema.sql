-- Complete Supabase Schema for FocusFlow Dashboard
-- Run this in Supabase SQL Editor

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Create Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Paused', 'Completed')),
  type TEXT DEFAULT 'Business' CHECK (type IN ('Business', 'Hobby', 'Personal')),
  color TEXT DEFAULT 'indigo',
  task_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'Todo' CHECK (status IN ('Todo', 'In Progress', 'Done', 'Stalled')),
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  due_date DATE,
  assignee TEXT DEFAULT 'AC',
  stalled_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT DEFAULT 'Notes' CHECK (type IN ('SOP', 'Template', 'Notes', 'Reference')),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  content TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_status_priority ON tasks(status, priority);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for anonymous users (read/write access)
-- Projects
CREATE POLICY "Allow anonymous read on projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert on projects" ON projects
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update on projects" ON projects
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on projects" ON projects
  FOR DELETE USING (true);

-- Tasks
CREATE POLICY "Allow anonymous read on tasks" ON tasks
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert on tasks" ON tasks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update on tasks" ON tasks
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on tasks" ON tasks
  FOR DELETE USING (true);

-- Documents
CREATE POLICY "Allow anonymous read on documents" ON documents
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert on documents" ON documents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update on documents" ON documents
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on documents" ON documents
  FOR DELETE USING (true);

-- Enable Realtime
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
  ALTER PUBLICATION supabase_realtime ADD TABLE projects;
  ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
  ALTER PUBLICATION supabase_realtime ADD TABLE documents;
COMMIT;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO projects (name, description, status, type, color, task_count) VALUES
  ('DPC', 'Deploy Hostinger project', 'Paused', 'Business', 'indigo', 12),
  ('Nanobot', 'Self-host Gmail replacement', 'Active', 'Business', 'orange', 8),
  ('OpenClaw-Unify', '5 to 1 LLM gateway', 'Active', 'Business', 'emerald', 5),
  ('Boringbest', 'Affiliate engine', 'Active', 'Hobby', 'pink', 3),
  ('Tetris-Task-Game', 'Gamified task management', 'Active', 'Hobby', 'purple', 15),
  ('Stardew-Farm-Manager', 'Switch farm automation', 'Active', 'Personal', 'blue', 2),
  ('Dashboard', 'This specific tool', 'Active', 'Personal', 'cyan', 20);

INSERT INTO tasks (title, description, status, priority, project_id, due_date, assignee) VALUES
  ('DPC audit', 'Full system audit for stalled project', 'Stalled', 'High', (SELECT id FROM projects WHERE name = 'DPC'), '2026-02-10', 'AC'),
  ('Vercel live', 'Push main branch to production', 'Todo', 'Critical', (SELECT id FROM projects WHERE name = 'DPC'), '2026-02-15', 'AC'),
  ('Design new landing page', 'Hero section and feature grid', 'Todo', 'High', (SELECT id FROM projects WHERE name = 'OpenClaw-Unify'), '2026-02-10', 'AC'),
  ('Implement authentication', 'Clerk integration for user auth', 'In Progress', 'High', (SELECT id FROM projects WHERE name = 'Nanobot'), '2026-02-08', 'SK'),
  ('Write API documentation', 'Endpoint definitions for v1', 'In Progress', 'Medium', (SELECT id FROM projects WHERE name = 'Boringbest'), '2026-02-15', 'MR'),
  ('Fix navigation bug', 'Mobile menu toggle fix', 'Done', 'Low', (SELECT id FROM projects WHERE name = 'Nanobot'), '2026-02-05', 'SK');

INSERT INTO documents (title, type, project_id, content) VALUES
  ('Deployment Process', 'SOP', (SELECT id FROM projects WHERE name = 'Nanobot'), 'Step-by-step deployment guide'),
  ('Email Templates', 'Template', (SELECT id FROM projects WHERE name = 'Tetris-Task-Game'), 'Standard email templates'),
  ('Meeting Notes - Q1 Planning', 'Notes', NULL, 'Q1 planning session notes'),
  ('API Reference', 'Reference', (SELECT id FROM projects WHERE name = 'OpenClaw-Unify'), 'API documentation v1.0'),
  ('Brand Guidelines', 'Reference', (SELECT id FROM projects WHERE name = 'DPC'), 'Brand colors and typography');
