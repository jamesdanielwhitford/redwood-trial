import { initClient } from "rwsdk/client";
import { initRealtimeClient } from "rwsdk/realtime/client";

initClient();

initRealtimeClient({
  key: "/counter",
});
