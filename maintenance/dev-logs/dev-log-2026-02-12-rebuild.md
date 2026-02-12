# Development Session Log - 2026-02-12 (Rebuild + Supabase Integration)

## The Objective
Rebuild the ADHD project management dashboard with a focus on simplicity and real-world usability, then integrate Supabase for real-time sync and OpenClaw API compatibility.

## The Evolution

### Phase 1: The Strip-Down
Initially removed Supabase to create a lean, offline-first app with localStorage. This worked but lacked the collaborative features needed for OpenClaw integration.

### Phase 2: The Re-Integration
Added Supabase back with a smarter approach:
- **Hybrid Architecture**: Frontend uses camelCase (JavaScript convention), database uses snake_case (SQL convention)
- **Data Transformation Layer**: Created transform functions in hooks to handle the conversion seamlessly
- **Realtime Subscriptions**: Live updates when tasks are created via API
- **REST API Ready**: OpenClaw can create tasks via standard HTTP requests

## Key Technical Wins

### 1. Snake Case to Camel Case Bridge
```typescript
// Transform snake_case from Supabase to camelCase for frontend
const transformTaskFromDB = (dbTask: any): Task => ({
  id: dbTask.id,
  title: dbTask.title,
  projectId: dbTask.project_id,  // snake → camel
  dueDate: dbTask.due_date,      // snake → camel
  stalledAt: dbTask.stalled_at,  // snake → camel
  updatedAt: dbTask.updated_at   // snake → camel
});
```

This pattern appears in all three hooks (useTasks, useProjects, useDocs) and solved the "Invalid Date" and data persistence issues.

### 2. Date Handling Without Timezone Bugs
Discovered that `new Date("2026-02-15")` interprets as UTC midnight, causing off-by-one-day errors in local timezones. Fixed by parsing explicitly:
```typescript
const [year, month, day] = task.dueDate.split('-').map(Number);
const date = new Date(year, month - 1, day); // Local time
```

### 3. Fahrenheit Weather
Open-Meteo API defaults to Celsius. Added `&temperature_unit=fahrenheit` parameter for US-based users.

### 4. Project Type Simplification
Changed from corporate terminology (Agency/Internal/Content) to personal categories:
- **Business** - Work-related projects
- **Hobby** - Side projects and learning
- **Personal** - Life admin and self-care

### 5. Dynamic Task Counting
ProjectsTable now calculates task counts in real-time by filtering the tasks array, rather than relying on the static `task_count` database field. This ensures the number always matches what's actually on the board.

## Bug Fixes & Polish

1. **Project Save Button** - Was calling empty function, now properly wired to updateProject
2. **Task Card Date Display** - Fixed "Invalid Date" and timezone offset issues
3. **Status/Type Persistence** - Project changes now save to Supabase and persist
4. **Polling Removal** - Removed 10-second polling once realtime subscriptions proved stable
5. **Mobile View Toggle** - Added Board/List view toggle for desktop users

## OpenClaw Integration Success

The dashboard now works seamlessly with OpenClaw:
- Tasks created via REST API appear instantly (via realtime)
- No authentication barriers (RLS policies allow anonymous access)
- Data transformations handle both manual edits and API-created tasks uniformly

## Stack Summary

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (dark theme)
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Drag & Drop**: @hello-pangea/dnd
- **Icons**: Lucide React
- **State Management**: Custom hooks with Supabase integration

## Key Files

- `hooks/useTasks.ts` - Task CRUD + realtime + data transformation
- `hooks/useProjects.ts` - Project CRUD + realtime + data transformation
- `hooks/useDocs.ts` - Document CRUD + realtime + data transformation
- `supabase-schema.sql` - Complete database schema with RLS policies
- `components/DetailPanel.tsx` - Unified editing for tasks and projects
- `components/WeatherWidget.tsx` - Weather with Fahrenheit support

## Time Audit

**Total Development Time**: ~6 hours
- Initial rebuild (offline-first): 3 hours
- Supabase integration: 2 hours
- Bug fixes and polish: 1 hour

## Reflection

The journey from "over-engineered" → "too simple" → "just right" taught valuable lessons about architectural balance. The key insight: **complexity should match the actual use case**. 

For a personal dashboard, localStorage would suffice. But for OpenClaw integration (automated task creation), Supabase provides the necessary API surface while keeping the frontend code clean.

The data transformation pattern (snake ↔ camel) is now a reusable template for any Supabase + TypeScript project. It decouples the database schema from the frontend types, allowing both to evolve independently.

**Most Satisfying**: Seeing a task appear instantly in the dashboard after creating it via curl command. The realtime subscription working perfectly makes the whole system feel alive.

## Next Steps

- [ ] Column sorting on Projects page (click headers to sort)
- [ ] Task filtering by project, priority, or assignee
- [ ] Bulk operations (move multiple tasks)
- [ ] Due date notifications
- [ ] JSON export/import for backups
- [ ] Dark/light theme toggle
- [ ] Keyboard shortcuts
- [ ] Time tracking per task
