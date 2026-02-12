
import { Project, Task, Document } from './types';

export const INITIAL_PROJECTS: Project[] = [
  { id: 'p1', name: 'DPC', description: 'Deploy Hostinger project', status: 'Paused', type: 'Business', color: 'indigo', taskCount: 12, createdAt: '2026-01-15' },
  { id: 'p2', name: 'Nanobot', description: 'Self-host Gmail replacement', status: 'Active', type: 'Business', color: 'orange', taskCount: 8, createdAt: '2026-01-20' },
  { id: 'p3', name: 'OpenClaw-Unify', description: '5 to 1 LLM gateway', status: 'Active', type: 'Business', color: 'emerald', taskCount: 5, createdAt: '2026-01-25' },
  { id: 'p4', name: 'Boringbest', description: 'Affiliate engine', status: 'Active', type: 'Hobby', color: 'pink', taskCount: 3, createdAt: '2026-01-10' },
  { id: 'p5', name: 'Tetris-Task-Game', description: 'Gamified task management', status: 'Active', type: 'Hobby', color: 'purple', taskCount: 15, createdAt: '2026-02-01' },
  { id: 'p6', name: 'Stardew-Farm-Manager', description: 'Switch farm automation', status: 'Active', type: 'Personal', color: 'blue', taskCount: 2, createdAt: '2026-02-05' },
  { id: 'p7', name: 'Dashboard', description: 'This specific tool', status: 'Active', type: 'Personal', color: 'cyan', taskCount: 20, createdAt: '2026-02-08' },
];

export const INITIAL_TASKS: Task[] = [
  { id: 't1', title: 'DPC audit', description: 'Full system audit for stalled project', status: 'Stalled', priority: 'High', projectId: 'p1', dueDate: '2026-02-10', assignee: 'AC', stalledAt: new Date(Date.now() - 90000000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 't2', title: 'Vercel live', description: 'Push main branch to production', status: 'Todo', priority: 'Critical', projectId: 'p1', dueDate: '2026-02-15', assignee: 'AC', updatedAt: new Date().toISOString() },
  { id: 't3', title: 'Design new landing page', description: 'Hero section and feature grid', status: 'Todo', priority: 'High', projectId: 'p3', dueDate: '2026-02-10', assignee: 'AC', updatedAt: new Date().toISOString() },
  { id: 't4', title: 'Implement authentication', description: 'Clerk integration for user auth', status: 'In Progress', priority: 'High', projectId: 'p2', dueDate: '2026-02-08', assignee: 'SK', updatedAt: new Date().toISOString() },
  { id: 't5', title: 'Write API documentation', description: 'Endpoint definitions for v1', status: 'In Progress', priority: 'Medium', projectId: 'p4', dueDate: '2026-02-15', assignee: 'MR', updatedAt: new Date().toISOString() },
  { id: 't6', title: 'Fix navigation bug', description: 'Mobile menu toggle fix', status: 'Done', priority: 'Low', projectId: 'p2', dueDate: '2026-02-05', assignee: 'SK', updatedAt: new Date().toISOString() },
];

export const INITIAL_DOCS: Document[] = [
  { id: 'd1', title: 'Deployment Process', type: 'SOP', projectId: 'p2', updatedAt: '2026-02-05' },
  { id: 'd2', title: 'Email Templates', type: 'Template', projectId: 'p5', updatedAt: '2026-02-03' },
  { id: 'd3', title: 'Meeting Notes - Q1 Planning', type: 'Notes', updatedAt: '2026-02-01' },
  { id: 'd4', title: 'API Reference', type: 'Reference', projectId: 'p3', updatedAt: '2026-01-28' },
  { id: 'd5', title: 'Brand Guidelines', type: 'Reference', projectId: 'p1', updatedAt: '2026-01-20' },
];
