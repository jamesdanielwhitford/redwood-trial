"use client";

import { increment, decrement } from "./functions";

export const CounterButtons = () => {
  return (
    <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
      <form action={decrement}>
        <button 
          type="submit"
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
      </form>
      <form action={increment}>
        <button 
          type="submit"
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
      </form>
    </div>
  );
};