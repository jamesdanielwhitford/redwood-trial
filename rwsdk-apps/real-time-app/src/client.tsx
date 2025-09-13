import { initRealtimeClient } from "rwsdk/realtime/client";
import "./styles.css";

// Initialize realtime client with current pathname as key
initRealtimeClient({
  key: window.location.pathname,
});
