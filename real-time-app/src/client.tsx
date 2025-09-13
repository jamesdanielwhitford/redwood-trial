import { initRealtimeClient } from "rwsdk/realtime/client";

// Initialize realtime client with current pathname as key
initRealtimeClient({
  key: window.location.pathname,
});
