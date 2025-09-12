import { getCount } from "./functions";
import { CounterButtons } from "./CounterButtons";

const Counter = async () => {
  const count = await getCount();
  
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Shared Real-Time Counter</h1>
      <div style={{ fontSize: "4rem", margin: "2rem 0", fontWeight: "bold" }}>
        {count}
      </div>
      <CounterButtons />
      <p style={{ marginTop: "2rem", color: "#666" }}>
        This counter updates in real-time across all connected clients!
      </p>
    </div>
  );
};

export default Counter;