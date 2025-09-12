# Example Realtime Notes App Analysis

## File Structure
```
src/
├── worker.tsx           # Main worker entry point
├── client.tsx          # Realtime client initialization
├── noteDurableObject.ts # Custom Durable Object for note storage
└── app/
    └── pages/note/
        ├── Note.tsx     # Server component that renders note
        ├── Editor.tsx   # Client component for editing
        └── functions.ts # Server functions for data access
```

## Key Implementation Details

### 1. Custom Durable Object (NoteDurableObject)
- Stores note content in durable storage
- Provides `getContent()` and `setContent()` methods
- Persists data across requests

### 2. Server Functions
```ts
"use server";
export const getContent = async (key: string) => {
  const doId = env.NOTE_DURABLE_OBJECT.idFromName(key);
  const noteDO = env.NOTE_DURABLE_OBJECT.get(doId);
  return noteDO.getContent();
};
```

### 3. API Route for Updates
```ts
route("/api/note/:key", async ({ request, params }) => {
  // Update content in Durable Object
  const body = await request.text();
  const id = env.NOTE_DURABLE_OBJECT.idFromName(params.key);
  const durableObject = env.NOTE_DURABLE_OBJECT.get(id);
  await durableObject.setContent(body);

  // Trigger realtime updates for all clients
  await renderRealtimeClients({
    durableObjectNamespace: env.REALTIME_DURABLE_OBJECT,
    key: `/note/${params.key}`,
  });
});
```

### 4. React Server Component
```tsx
const Note = async ({ params }: RequestInfo<{ key: string }>) => {
  const key = params.key;
  const content = await getContent(key); // Fetch latest data
  return <Editor noteKey={key} initialContent={content} />;
};
```

## Flow Summary
1. User loads `/note/some-key`
2. Client connects to realtime with key `/note/some-key`
3. Server component fetches content from Durable Object
4. When user edits, API route updates Durable Object
5. API route calls `renderRealtimeClients()` to update all connected clients
6. All clients re-render with fresh data from server