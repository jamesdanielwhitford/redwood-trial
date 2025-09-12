"use client";

export const CounterButtons = () => {
  const handleIncrement = async () => {
    try {
      await fetch("/api/counter/increment", { method: "POST" });
    } catch (error) {
      console.error("Error incrementing counter:", error);
    }
  };

  const handleDecrement = async () => {
    try {
      await fetch("/api/counter/decrement", { method: "POST" });
    } catch (error) {
      console.error("Error decrementing counter:", error);
    }
  };

  return (
    <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
      <button 
        onClick={handleDecrement}
        style={{
          fontSize: "2rem",
          padding: "1rem 2rem",
          background: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          minWidth: "80px"
        }}
      >
        -
      </button>
      <button 
        onClick={handleIncrement}
        style={{
          fontSize: "2rem",
          padding: "1rem 2rem",
          background: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          minWidth: "80px"
        }}
      >
        +
      </button>
    </div>
  );
};