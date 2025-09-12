# RedwoodJS Realtime Architecture Research

## Key Components for Realtime Apps

### 1. Client Setup
```ts
// src/client.tsx
import { initRealtimeClient } from "rwsdk/realtime/client";

initRealtimeClient({
  key: window.location.pathname, // Groups clients together
});
```

### 2. Worker Setup
```ts
// src/worker.tsx
import { realtimeRoute } from "rwsdk/realtime/worker";
import { env } from "cloudflare:workers";

export { RealtimeDurableObject } from "rwsdk/realtime/durableObject";

export default defineApp([
  realtimeRoute(() => env.REALTIME_DURABLE_OBJECT),
  // ... your routes
]);
```

### 3. Wrangler Configuration
```jsonc
// wrangler.jsonc
{
  "durable_objects": {
    "bindings": [
      {
        "name": "REALTIME_DURABLE_OBJECT",
        "class_name": "RealtimeDurableObject"
      }
    ]
  }
}
```

## How Realtime Works

1. **Client connects** with a `key` (e.g., "/counter/room-1")
2. **All clients with same key** connect to same Durable Object instance
3. **When action happens** on one client:
   - Action updates server state
   - Server triggers re-render for all clients with same key
   - All clients receive updated UI automatically

## Key Functions

- `initRealtimeClient({ key })` - Connect client to realtime group
- `realtimeRoute()` - Setup WebSocket route in worker
- `renderRealtimeClients({ durableObjectNamespace, key })` - Trigger re-render for all clients

## React Server Components Integration

- RSC renders on server based on latest state
- When state changes, all connected clients get new rendered UI
- No manual subscription management needed
- Just write normal RSC components and let realtime system handle updates