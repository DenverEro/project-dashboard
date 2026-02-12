
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type Status = 'Todo' | 'In Progress' | 'Done' | 'Stalled';
export type ProjectType = 'Business' | 'Hobby' | 'Personal';
export type ProjectStatus = 'Active' | 'Paused' | 'Completed';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  type: ProjectType;
  color: string;
  taskCount: number;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  projectId: string;
  dueDate: string;
  assignee: string;
  stalledAt?: string; // ISO string if stalled
  updatedAt: string;
}

export interface Document {
  id: string;
  title: string;
  type: 'SOP' | 'Template' | 'Notes' | 'Reference';
  projectId?: string;
  content?: string;
  updatedAt: string;
}

export type View = 'Dashboard' | 'Projects' | 'Content' | 'Documents';
