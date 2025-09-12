"use client";

import { useState } from "react";
import { PollWithChoices } from "./functions";

// Generate a unique voter identifier for this browser
const getVoterIdentifier = () => {
  let identifier = localStorage.getItem("voterIdentifier");
  if (!identifier) {
    identifier = `voter_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem("voterIdentifier", identifier);
  }
  return identifier;
};

export const PollVoting = ({ poll }: { poll: PollWithChoices }) => {
  const [isVoting, setIsVoting] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const handleVote = async (choiceId: string) => {
    if (isVoting) return;
    
    setIsVoting(true);
    setSelectedChoice(choiceId);
    
    try {
      const voterIdentifier = getVoterIdentifier();
      
      const response = await fetch(`/api/poll/${poll.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          choiceId,
          voterIdentifier,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to vote");
      }
      
      // The real-time system will update the UI automatically
    } catch (error) {
      console.error("Voting error:", error);
      alert("Failed to vote. Please try again.");
    } finally {
      setIsVoting(false);
      setSelectedChoice(null);
    }
  };

  return (
    <div>
      <h3 style={{ 
        fontSize: "1.5rem", 
        marginBottom: "1.5rem", 
        color: "#333" 
      }}>
        Cast Your Vote
      </h3>
      
      <div style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: "1rem", 
        justifyContent: "center",
        alignItems: "center"
      }}>
        {poll.choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => handleVote(choice.id)}
            disabled={isVoting}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem 1.5rem",
              backgroundColor: selectedChoice === choice.id 
                ? choice.color 
                : isVoting 
                ? "#ccc" 
                : "white",
              color: selectedChoice === choice.id 
                ? "white" 
                : choice.color,
              border: `2px solid ${choice.color}`,
              borderRadius: "50px",
              cursor: isVoting ? "not-allowed" : "pointer",
              fontSize: "1.1rem",
              fontWeight: "bold",
              transition: "all 0.2s ease",
              minWidth: "140px",
              justifyContent: "center",
              opacity: isVoting && selectedChoice !== choice.id ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isVoting) {
                e.currentTarget.style.backgroundColor = choice.color;
                e.currentTarget.style.color = "white";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isVoting && selectedChoice !== choice.id) {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.color = choice.color;
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            <span style={{ fontSize: "1.3rem" }}>{choice.emoji}</span>
            <span>
              {selectedChoice === choice.id && isVoting ? "Voting..." : choice.text}
            </span>
          </button>
        ))}
      </div>
      
      <p style={{ 
        marginTop: "1.5rem", 
        color: "#666",
        fontSize: "0.9rem"
      }}>
        You can change your vote at any time. Click again to toggle off.
      </p>
    </div>
  );
};