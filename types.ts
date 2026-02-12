
export type Status = 'Todo' | 'In Progress' | 'Done';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Paused' | 'Completed' | 'Stalled';
  type: string;
  created_at: string;
  due_date: string;
  assigned_to: string;
  created_by: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  status: Status;
  priority: number;
  notes: string;
  due: string;
  updated_at: string;
  created_by: string;
  project?: Project;
}

export interface Doc {
  id: string;
  project_id: string;
  title: string;
  body: string;
  status: string;
  created_at: string;
  created_by: string;
  project?: Project;
}
