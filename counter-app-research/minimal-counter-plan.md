# Minimal Counter App Plan

## Goal
Create the simplest possible realtime app: a counter that multiple clients can increment/decrement, and all clients see updates instantly.

## Architecture

### 1. Data Storage
- Use a simple Durable Object to store the counter value
- No database needed - just store number in memory/durable storage

### 2. Counter Durable Object
```ts
export class CounterDurableObject extends DurableObject {
  private count: number | undefined;
  
  async getCount(): Promise<number> {
    return this.count ??= (await this.state.storage.get<number>("count")) ?? 0;
  }
  
  async increment(): Promise<number> {
    this.count = await this.getCount() + 1;
    await this.state.storage.put<number>("count", this.count);
    return this.count;
  }
  
  async decrement(): Promise<number> {
    this.count = await this.getCount() - 1;
    await this.state.storage.put<number>("count", this.count);
    return this.count;
  }
}
```

### 3. Server Functions
```ts
"use server";
export const getCount = async () => {
  const doId = env.COUNTER_DURABLE_OBJECT.idFromName("global-counter");
  const counterDO = env.COUNTER_DURABLE_OBJECT.get(doId);
  return counterDO.getCount();
};

export const increment = async () => {
  const doId = env.COUNTER_DURABLE_OBJECT.idFromName("global-counter");
  const counterDO = env.COUNTER_DURABLE_OBJECT.get(doId);
  await counterDO.increment();
};
```

### 4. Server Component
```tsx
const Counter = async () => {
  const count = await getCount();
  return (
    <div>
      <h1>Shared Counter: {count}</h1>
      <CounterButtons />
    </div>
  );
};
```

### 5. Client Component
```tsx
"use client";
export const CounterButtons = () => {
  return (
    <div>
      <form action={increment}>
        <button type="submit">+</button>
      </form>
      <form action={decrement}>
        <button type="submit">-</button>
      </form>
    </div>
  );
};
```

### 6. Realtime Setup
- All clients connect with same key (e.g., "/counter")  
- When button clicked, server function runs
- After update, trigger `renderRealtimeClients()` for all connected clients
- All clients re-render with new count value

## Files to Create/Modify
1. `src/counterDurableObject.ts` - Durable Object for counter state
2. `src/app/pages/Counter.tsx` - Main counter page (server component)
3. `src/app/pages/CounterButtons.tsx` - Interactive buttons (client component) 
4. `src/app/pages/functions.ts` - Server functions for counter operations
5. Update `src/worker.tsx` - Add counter routes and durable object export
6. Update `wrangler.jsonc` - Add counter durable object binding
7. Update `src/client.tsx` - Set realtime key to "/counter"

This gives us the absolute minimal realtime app - just a number that multiple users can change together.