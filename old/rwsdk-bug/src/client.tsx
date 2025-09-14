// import { initClient } from "rwsdk/client";

import { initRealtimeClient } from "rwsdk/realtime/client";

// initClient();

// Initialize realtime client with current pathname as key
initRealtimeClient({
  key: window.location.pathname,
});