# FocusFlow Dashboard

A dark-themed, ADHD-friendly project management dashboard designed for visual organization and real-time collaboration. Built with React, TypeScript, and Supabase.

## Features

- **Kanban Board** - Drag-and-drop task management with four columns (Todo, In Progress, Done, Stalled)
- **Stalled Task Detection** - Visual alerts when tasks sit too long in "In Progress"
- **Real-time Sync** - Supabase integration for instant updates across all clients
- **OpenClaw Integration** - REST API support for automated task creation
- **Mobile Responsive** - Adaptive layout with list view for mobile, board view for desktop
- **Project Management** - Organize tasks by projects with type categorization (Business, Hobby, Personal)
- **Weather & Time** - Live widgets showing current conditions and time for Saint Johns, MI

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)

### 1. Clone and Install

```bash
git clone https://github.com/DenverEro/project-dashboard.git
cd project-dashboard
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** → **API** 
3. Copy the **URL** and **anon public** key
4. Paste them into `.env.local`
5. Open the **SQL Editor** in Supabase
6. Run the schema from `supabase-schema.sql`

### 4. Run Locally

```bash
npm run dev
```

Open http://localhost:5173

## Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/DenverEro/project-dashboard)

### Manual Deploy

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **Add New Project**
4. Import your GitHub repository
5. Add environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy**

## OpenClaw Integration

This dashboard is designed to work with OpenClaw via Supabase REST API.

### API Endpoints

All data operations are available through the Supabase REST API:

```bash
# Get all tasks
curl https://your-project.supabase.co/rest/v1/tasks \
  -H "apikey: your-anon-key"

# Create a task
curl -X POST https://your-project.supabase.co/rest/v1/tasks \
  -H "apikey: your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"title": "New Task", "status": "Todo", "project_id": "uuid"}'
```

### Realtime Sync

Changes made via API appear instantly in the dashboard through Supabase realtime subscriptions.

## Project Structure

```
├── components/
│   ├── KanbanBoard.tsx      # Drag-and-drop board
│   ├── TaskList.tsx         # Mobile list view
│   ├── TaskCard.tsx         # Individual task card
│   ├── ProjectsTable.tsx    # Project listing
│   ├── DetailPanel.tsx      # Slide-out edit panel
│   ├── StatsBar.tsx         # Dashboard metrics
│   ├── WeatherWidget.tsx    # Weather display
│   └── DateTimeDisplay.tsx  # Clock widget
├── hooks/
│   ├── useTasks.ts          # Tasks CRUD + realtime
│   ├── useProjects.ts       # Projects CRUD + realtime
│   └── useDocs.ts           # Documents CRUD + realtime
├── supabase.ts              # Supabase client config
├── supabase-schema.sql      # Database setup
└── types.ts                 # TypeScript types
```

## Future Updates

### Planned Features

- [ ] **Column Sorting** - Click column headers on the Projects page to sort by Name, Status, Type, Tasks, or Created date
- [ ] **Task Filtering** - Filter tasks by project, priority, or assignee
- [ ] **Bulk Operations** - Select and move multiple tasks at once
- [ ] **Due Date Notifications** - Visual alerts for tasks approaching deadline
- [ ] **Export/Import** - JSON backup and restore functionality
- [ ] **Dark/Light Theme** - Toggle between dark and light modes

### Technical Improvements

- [ ] Add loading skeletons for better UX
- [ ] Implement optimistic updates for instant feedback
- [ ] Add keyboard shortcuts for power users
- [ ] Create PWA for offline functionality
- [ ] Add task time tracking

## Customization

### Change Weather Location

Edit `components/WeatherWidget.tsx`:

```typescript
// Default: Saint Johns, MI 48879
latitude = 43.0014,
longitude = -84.5592
```

### Add More Project Colors

Edit `components/DetailPanel.tsx`:

```typescript
const PROJECT_COLORS = [
  { name: 'indigo', class: 'bg-indigo-500' },
  // Add more colors here
];
```

## Troubleshooting

### "Supabase not configured" error
- Check that `.env.local` exists with correct values
- Restart the dev server after editing env vars

### Sync not working
- Verify Supabase project is active
- Check that tables exist (run `supabase-schema.sql`)
- Check browser console for API errors

### Build fails
```bash
npm run build
```
Check for TypeScript errors and missing dependencies.

## Tech Stack

- **React 19** + TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Supabase** for backend + realtime
- **@hello-pangea/dnd** for drag-and-drop
- **Lucide React** for icons

## License

MIT
