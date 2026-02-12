
-- Create Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Active',
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  due_date DATE,
  assigned_to TEXT,
  created_by TEXT
);

-- Create Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'Todo',
  priority INTEGER DEFAULT 2, -- 1: High, 2: Medium, 3: Low
  notes TEXT,
  due DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Create Docs table
CREATE TABLE docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT,
  status TEXT DEFAULT 'Draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Add sample project data (DPC, Nanobot, etc.)
INSERT INTO projects (name, status, type, description) VALUES
('DPC', 'Stalled', 'Agency', 'Direct Payment Cloud infrastructure'),
('Nanobot', 'Active', 'Internal', 'Miniature robotic automation'),
('OpenClaw-Unify', 'Active', 'Internal', 'Consolidated claw control API'),
('Boringbest', 'Paused', 'Agency', 'Efficiency optimization tool'),
('Tetris-Task-Game', 'Active', 'Content', 'Gamified task management'),
('Stardew-Farm-Manager', 'Completed', 'Internal', 'Farm simulation utility'),
('Dashboard', 'Active', 'Agency', 'Centralized analytics UI'),
('AI-Context', 'Active', 'Internal', 'LLM context window optimizer'),
('Win11-Upgrade', 'Paused', 'Internal', 'Corporate OS transition'),
('FindYourDPC', 'Active', 'Content', 'Provider locator platform');

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE docs;
