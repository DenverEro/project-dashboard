<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# FocusFlow Dashboard

ADHD-friendly project management dashboard with offline-first capabilities and Supabase sync for OpenClaw integration.

## Features

- **Kanban Board** with drag-and-drop task management
- **Offline-First** - Works without internet, syncs when available
- **Supabase Integration** - REST API + Realtime sync for OpenClaw
- **Mobile Responsive** - List view for mobile, board view for desktop
- **Stalled Tasks** - Visual alerts for tasks stuck too long
- **Weather & Time** - Live widgets for Saint Johns, MI (48879)

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

All data operations are available through the `supabaseApi` object:

```typescript
import { supabaseApi } from './supabase';

// Projects
const projects = await supabaseApi.getProjects();
await supabaseApi.createProject({ name: 'New Project', ... });

// Tasks
const tasks = await supabaseApi.getTasks();
await supabaseApi.moveTask(taskId, 'Done');

// Documents
const docs = await supabaseApi.getDocuments();
```

### Realtime Sync

Subscribe to changes for live updates:

```typescript
const subscription = supabaseApi.subscribeToTasks((payload) => {
  console.log('Task changed:', payload);
});
```

### Hybrid Mode

The app works offline by default:
- Data loads from localStorage instantly
- Syncs to Supabase in background when configured
- Falls back to localStorage if Supabase is unavailable

## Project Structure

```
├── components/
│   ├── KanbanBoard.tsx      # Drag-and-drop board
│   ├── TaskList.tsx         # Mobile list view
│   ├── TaskCard.tsx         # Individual task card
│   ├── DetailPanel.tsx      # Slide-out edit panel
│   ├── StatsBar.tsx         # Dashboard metrics
│   ├── WeatherWidget.tsx    # Weather display
│   └── DateTimeDisplay.tsx  # Clock widget
├── store.ts                 # State management + Supabase sync
├── supabase.ts             # REST API client
├── supabase-schema.sql     # Database setup
├── constants.tsx           # Initial data
└── types.ts               # TypeScript types
```

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
