# Cloudflare Workers Real-Time Voting App

A real-time voting application (Dogs vs Cats) built with Cloudflare Workers, Durable Objects, WebSocket hibernation, and React/TypeScript frontend.

This project demonstrates how to build real-time features using raw Cloudflare Workers APIs, replacing the abstractions from rwsdk with direct implementations.

## Project Setup

### Step 1: Initial Project Creation ✅
**Command used:** 
```bash
npx create-cloudflare cloudflare-realtime-app --framework react --typescript --git
```

**Options selected:**
- Framework: React
- Variant: TypeScript  
- Platform: Workers with Assets
- Deploy: No (will deploy later)

**What was created:**
- React 19 + TypeScript frontend with Vite
- Cloudflare Workers backend (`worker/index.ts`)
- @cloudflare/vite-plugin integration
- Wrangler 4.35 configuration
- ESLint setup

**Commit:** `1e97df3` - Initial Cloudflare Workers + React project setup

---

## Implementation Progress

### Step 2: README Documentation ✅
- [x] Document initial project setup
- [x] Update with step-by-step progress

**Commands run:**
- `git add .` - Stage all files
- `git commit -m "Initial Cloudflare Workers + React project setup"` - Initial commit

### Step 3: Backend Configuration ✅
- [x] Update wrangler.jsonc with D1 database binding
- [x] Add Durable Objects configuration for real-time features
- [x] Create D1 migration for votes storage

**What was implemented:**
- Added `VOTING_DURABLE_OBJECT` and `REALTIME_DURABLE_OBJECT` bindings in wrangler.jsonc
- Added D1 database binding configuration
- Created `migrations/0001_votes.sql` with votes table schema
- Added migration configuration for Durable Object deployments

### Step 4: Durable Objects Implementation ✅
- [x] Create `VotingDurableObject` with vote persistence
- [x] Implement `RealtimeDurableObject` with WebSocket hibernation
- [x] Add WebSocket connection management

**What was implemented:**
- `worker/durable-objects/VotingDurableObject.ts` - Handles vote counting with D1 persistence
- `worker/durable-objects/RealtimeDurableObject.ts` - WebSocket hibernation for real-time updates
- Proper fetch-based API for Durable Object communication
- Session management and WebSocket lifecycle handling

### Step 5: Worker API Routes ✅
- [x] Replace basic worker with real-time routing
- [x] Add vote endpoints (`/api/vote/dog`, `/api/vote/cat`)
- [x] Add WebSocket upgrade endpoint (`/ws`)
- [x] Add get votes endpoint (`/api/votes`)

**What was implemented:**
- Replaced `worker/index.ts` with complete real-time API routing
- Vote endpoints that update Durable Objects and broadcast to WebSocket clients
- WebSocket upgrade handling via RealtimeDurableObject
- Health check and reset endpoints for testing

**Commands run:**
- `npm run cf-typegen` - Generate TypeScript types for Durable Object bindings
- `npm run build` - Test compilation and build process

### Step 6: Frontend Real-Time Features ✅
- [x] Create custom WebSocket hook (replace rwsdk client)
- [x] Port VotingApp component from rwsdk version
- [x] Port VotingButtons component from rwsdk version
- [x] Replace default App.tsx with voting interface

**What was implemented:**
- `src/hooks/useWebSocket.ts` - Custom hook replacing rwsdk/realtime/client
- `src/components/VotingApp.tsx` - Main voting interface with live results
- `src/components/VotingButtons.tsx` - Vote buttons with error handling
- Auto-reconnection logic with exponential backoff
- Real-time vote update handling and connection status indicator
- WebSocket connection management and error handling
- Responsive design matching original rwsdk styling

**Commands run:**
- `npm run build` - Verified frontend compilation and build process

### Step 7: Testing & Deployment ⏳
- [ ] Test real-time voting with multiple clients
- [ ] Verify vote persistence
- [ ] Deploy to Cloudflare Workers

**Current Status:** 🎉 **Complete Implementation Ready for Testing**

The real-time voting app has been successfully rebuilt using raw Cloudflare Workers APIs, replacing all rwsdk abstractions while maintaining the same functionality and user experience.

---

## Architecture Overview

### Backend (Cloudflare Workers)
- **Main Worker** (`worker/index.ts`): HTTP routing + WebSocket upgrades
- **VotingDurableObject**: Vote counting with D1 persistence
- **RealtimeDurableObject**: WebSocket coordination with hibernation
- **D1 Database**: Persistent vote storage

### Frontend (React/TypeScript)
- **VotingApp**: Main voting interface
- **VotingButtons**: Vote interaction buttons
- **useWebSocket**: Custom hook for real-time updates
- **Vite + @cloudflare/vite-plugin**: Build system

### Key Replacements from rwsdk
- `rwsdk/realtime/client` → Custom WebSocket hook
- `rwsdk/realtime/durableObject` → Custom WebSocket hibernation
- `rwsdk/worker` routing → Raw Cloudflare Workers routing
- Automatic re-rendering → Manual WebSocket broadcasts

---

## Development Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production  
npm run deploy     # Deploy to Cloudflare Workers
npm run lint       # Run ESLint
```

## Database Setup

```bash
# Create D1 database
npx wrangler d1 create realtime-voting-db

# Apply migrations (local)
npx wrangler d1 migrations apply realtime-voting-db --local

# Apply migrations (production)
npx wrangler d1 migrations apply realtime-voting-db --remote
```




```
~/ cloudflare-realtime-app npx wrangler d1 create realtime-voting-db

 ⛅️ wrangler 4.35.0
───────────────────
✅ Successfully created DB 'realtime-voting-db' in region WEUR
Created your new D1 database.

To access your new D1 Database in your Worker, add the following snippet to your configuration file:
{
  "d1_databases": [
    {
      "binding": "realtime_voting_db",
      "database_name": "realtime-voting-db",
      "database_id": "a580168b-8919-4847-a1af-3e88ac48bc57"
    }
  ]
}
✔ Would you like Wrangler to add it on your behalf? › Yes
```


```
~/ cloudflare-realtime-app npx wrangler d1 migrations apply realtime-voting-db --local

 ⛅️ wrangler 4.35.0
───────────────────
Migrations to be applied:
┌────────────────┐
│ name           │
├────────────────┤
│ 0001_votes.sql │
└────────────────┘
✔ About to apply 1 migration(s)
Your database may not be available to serve requests during the migration, continue? … yes
🌀 Executing on local database realtime-voting-db (placeholder-replace-with-actual-id) from .wrangler/state/v3/d1:
🌀 To execute on your remote database, add a --remote flag to your wrangler command.
🚣 4 commands executed successfully.
┌────────────────┬────────┐
│ name           │ status │
├────────────────┼────────┤
│ 0001_votes.sql │ ✅     │
```