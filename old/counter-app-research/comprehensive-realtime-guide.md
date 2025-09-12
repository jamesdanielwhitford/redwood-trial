# Complete Guide to RedwoodJS Realtime Implementation

## ⚠️ Critical Client Initialization

### The Most Important Rule

**For realtime apps, use ONLY `initRealtimeClient()` - never both `initClient()` and `initRealtimeClient()` together.**

```ts
// ❌ WRONG - Causes ReadableStream conflicts
import { initClient } from "rwsdk/client";
import { initRealtimeClient } from "rwsdk/realtime/client";

initClient();                    // Don't use this in realtime apps
initRealtimeClient({ key: "/" }); // This will conflict

// ✅ CORRECT - Realtime client handles everything
import { initRealtimeClient } from "rwsdk/realtime/client";

initRealtimeClient({
  key: window.location.pathname,
});
```

### Why This Matters

- `initClient()` - Sets up standard React Server Components hydration
- `initRealtimeClient()` - Sets up WebSocket-based realtime client that **also handles RSC updates**
- **Using both creates a ReadableStream reader conflict** causing the error: `"ReadableStreamDefaultReader constructor can only accept readable streams that are not yet locked"`

### When to Use Which

| App Type | Client Initialization | Use Case |
|----------|---------------------|----------|
| **Standard App** | `initClient()` only | No realtime features needed |
| **Realtime App** | `initRealtimeClient()` only | Want realtime updates via WebSockets |
| **Mixed App** | `initRealtimeClient()` only | Some pages need realtime, others don't |

## 🏗️ Complete Implementation Steps

### 1. Client Setup (`src/client.tsx`)

```ts
import { initRealtimeClient } from "rwsdk/realtime/client";

// Use pathname to group clients by page
initRealtimeClient({
  key: window.location.pathname,
});
```

**Key Concepts:**
- The `key` determines which clients receive the same updates
- All clients with the same `key` connect to the same Durable Object instance
- Using `window.location.pathname` means clients on `/counter` only get counter updates

### 2. Durable Object for State (`src/yourDurableObject.ts`)

```ts
import { DurableObject } from "cloudflare:workers";

export class CounterDurableObject extends DurableObject {
  private state: DurableObjectState;
  private count: number | undefined;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.state = state;
    this.count = undefined;
  }

  async getCount(): Promise<number> {
    // Cache in memory, fallback to persistent storage
    return (this.count ??=
      (await this.state.storage.get<number>("count")) ?? 0);
  }

  async increment(): Promise<number> {
    this.count = (await this.getCount()) + 1;
    // Persist to durable storage
    await this.state.storage.put<number>("count", this.count);
    return this.count;
  }

  async decrement(): Promise<number> {
    this.count = (await this.getCount()) - 1;
    await this.state.storage.put<number>("count", this.count);
    return this.count;
  }
}
```

### 3. Worker Configuration (`src/worker.tsx`)

```ts
import { defineApp } from "rwsdk/worker";
import { route, render } from "rwsdk/router";
import { realtimeRoute, renderRealtimeClients } from "rwsdk/realtime/worker";
import { env } from "cloudflare:workers";
import Counter from "@/app/pages/counter/Counter";

// Export all durable objects
export { RealtimeDurableObject } from "rwsdk/realtime/durableObject";
export { CounterDurableObject } from "./counterDurableObject";

export default defineApp([
  // Must include realtime route for WebSocket handling
  realtimeRoute(() => env.REALTIME_DURABLE_OBJECT),
  
  // API routes that trigger realtime updates
  route("/api/counter/increment", async ({ request }) => {
    if (request.method !== "POST") {
      return new Response(null, { status: 405 });
    }

    // Update your durable object
    const doId = env.COUNTER_DURABLE_OBJECT.idFromName("global-counter");
    const counterDO = env.COUNTER_DURABLE_OBJECT.get(doId);
    await counterDO.increment();

    // Trigger realtime updates for all clients with this key
    await renderRealtimeClients({
      durableObjectNamespace: env.REALTIME_DURABLE_OBJECT,
      key: "/counter", // Must match the page path
    });

    return new Response(null, { status: 200 });
  }),

  // Your page routes
  render(Document, [
    route("/counter", Counter),
    // ... other routes
  ]),
]);
```

### 4. Wrangler Configuration (`wrangler.jsonc`)

```jsonc
{
  "durable_objects": {
    "bindings": [
      {
        "name": "REALTIME_DURABLE_OBJECT",
        "class_name": "RealtimeDurableObject"
      },
      {
        "name": "COUNTER_DURABLE_OBJECT", 
        "class_name": "CounterDurableObject"
      }
    ]
  },
  "migrations": [
    {
      "tag": "v2",
      "new_sqlite_classes": ["RealtimeDurableObject", "CounterDurableObject"]
    }
  ]
}
```

### 5. Server Functions (`src/app/pages/counter/functions.ts`)

```ts
"use server";

import { env } from "cloudflare:workers";

// Server functions should ONLY read data
export const getCount = async (): Promise<number> => {
  const doId = env.COUNTER_DURABLE_OBJECT.idFromName("global-counter");
  const counterDO = env.COUNTER_DURABLE_OBJECT.get(doId);
  return counterDO.getCount();
};

// DON'T call renderRealtimeClients() from server functions
// Use API routes instead for mutations + realtime updates
```

### 6. React Server Component (`src/app/pages/counter/Counter.tsx`)

```tsx
import { getCount } from "./functions";
import { CounterButtons } from "./CounterButtons";

const Counter = async () => {
  const count = await getCount(); // Fresh data on every render
  
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Shared Real-Time Counter</h1>
      <div style={{ fontSize: "4rem", margin: "2rem 0" }}>
        {count}
      </div>
      <CounterButtons />
    </div>
  );
};

export default Counter;
```

### 7. Client Component (`src/app/pages/counter/CounterButtons.tsx`)

```tsx
"use client";

export const CounterButtons = () => {
  const handleIncrement = async () => {
    try {
      await fetch("/api/counter/increment", { method: "POST" });
    } catch (error) {
      console.error("Error incrementing:", error);
    }
  };

  const handleDecrement = async () => {
    try {
      await fetch("/api/counter/decrement", { method: "POST" });
    } catch (error) {
      console.error("Error decrementing:", error);
    }
  };

  return (
    <div>
      <button onClick={handleDecrement}>-</button>
      <button onClick={handleIncrement}>+</button>
    </div>
  );
};
```

## 🚨 Common Pitfalls & Solutions

### ReadableStream Error
```
TypeError: Failed to execute 'getReader' on 'ReadableStream': ReadableStreamDefaultReader constructor can only accept readable streams that are not yet locked
```
**Solution:** Remove `initClient()` from `src/client.tsx` - use only `initRealtimeClient()`

### JSON Parsing Error  
```
SyntaxError: "[object Object]" is not valid JSON
```
**Solution:** Don't call `renderRealtimeClients()` from server functions. Use API routes instead.

### Module Resolution Error
```
Error: Can't resolve '@/yourDurableObject'
```
**Solution:** Use relative imports in `src/worker.tsx`: `import { YourDO } from "./yourDurableObject"`

### No Realtime Updates
**Check:**
1. Is `realtimeRoute()` in your worker app definition?
2. Are you calling `renderRealtimeClients()` after mutations?
3. Do the keys match between client and `renderRealtimeClients()`?
4. Are durable objects properly bound in `wrangler.jsonc`?

## 🔄 How Realtime Updates Work

### The Complete Flow

1. **Client connects** via `initRealtimeClient({ key: "/counter" })`
2. **User action** triggers client button click
3. **Client makes request** to API route (`fetch("/api/counter/increment")`)
4. **API route executes:**
   - Updates durable object state
   - Calls `renderRealtimeClients({ key: "/counter" })`
5. **Server re-renders** the React Server Component with fresh data
6. **All connected clients** with the same key receive the updated UI
7. **Client UI updates** automatically without page refresh

### Key Scoping Examples

```ts
// All clients on any page get updates
initRealtimeClient({ key: "global" });

// Only clients on /counter page get updates  
initRealtimeClient({ key: "/counter" });

// Only clients in specific chat room get updates
initRealtimeClient({ key: `/chat/${roomId}` });

// Dynamic scoping based on URL
initRealtimeClient({ key: window.location.pathname });
```

## ✅ Architecture Best Practices

### Do's
- ✅ Use `initRealtimeClient()` only for realtime apps
- ✅ Call `renderRealtimeClients()` from API routes after mutations
- ✅ Use server functions only for reading data
- ✅ Match keys exactly between client and server
- ✅ Use relative imports in worker files

### Don'ts  
- ❌ Never use both `initClient()` and `initRealtimeClient()` together
- ❌ Don't call `renderRealtimeClients()` from server functions
- ❌ Don't forget to export durable objects from worker
- ❌ Don't use `@/` import paths in worker files during development
- ❌ Don't forget `realtimeRoute()` in your app definition

## 🔧 Troubleshooting Checklist

When realtime isn't working:

1. **Check client.tsx**: Only `initRealtimeClient()`, no `initClient()`
2. **Check worker.tsx**: Includes `realtimeRoute()` in app definition
3. **Check API routes**: Call `renderRealtimeClients()` after mutations
4. **Check keys**: Same key used in client and `renderRealtimeClients()`
5. **Check wrangler.jsonc**: Both durable objects properly bound
6. **Check imports**: Use relative paths for durable objects in worker
7. **Check server functions**: Don't mix with realtime triggers

This guide represents lessons learned from debugging a working realtime counter implementation.