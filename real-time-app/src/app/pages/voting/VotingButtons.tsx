"use client";

export const VotingButtons = () => {
  const handleVoteDog = async () => {
    try {
      await fetch("/api/vote/dog", { method: "POST" });
    } catch (error) {
      console.error("Error voting for dog:", error);
    }
  };

  const handleVoteCat = async () => {
    try {
      await fetch("/api/vote/cat", { method: "POST" });
    } catch (error) {
      console.error("Error voting for cat:", error);
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      gap: "1rem", 
      justifyContent: "center",
      marginTop: "2rem"
    }}>
      <button 
        onClick={handleVoteDog}
        style={{
          fontSize: "1.5rem",
          padding: "1rem 2rem",
          background: "#4A90E2",
          color: "white",
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          minWidth: "150px",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          transition: "all 0.2s ease",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "#357ABD";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "#4A90E2";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <span style={{ fontSize: "2rem" }}>🐕</span>
        Vote Dog
      </button>
      
      <button 
        onClick={handleVoteCat}
        style={{
          fontSize: "1.5rem",
          padding: "1rem 2rem",
          background: "#E2904A",
          color: "white",
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          minWidth: "150px",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          transition: "all 0.2s ease",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "#D67B33";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "#E2904A";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <span style={{ fontSize: "2rem" }}>🐱</span>
        Vote Cat
      </button>
    </div>
  );
};