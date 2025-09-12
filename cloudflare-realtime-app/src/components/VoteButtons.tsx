import { useState } from "react";

type Choice = {
  id: string;
  text: string;
  color: string;
  votes: number;
};

type VoteButtonsProps = {
  pollId: string;
  choices: Choice[];
};

export function VoteButtons({ pollId, choices }: VoteButtonsProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [lastVoted, setLastVoted] = useState<string | null>(null);

  const handleVote = async (choiceId: string) => {
    setIsVoting(true);
    setLastVoted(choiceId);

    try {
      const response = await fetch(`/api/polls/${pollId}/vote/${choiceId}`, {
        method: "POST"
      });

      if (!response.ok) {
        console.error("Failed to vote:", await response.text());
      }
    } catch (error) {
      console.error("Failed to vote:", error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      gap: "1rem", 
      justifyContent: "center",
      flexWrap: "wrap",
      marginBottom: "2rem"
    }}>
      {choices.map(choice => (
        <button
          key={choice.id}
          onClick={() => handleVote(choice.id)}
          disabled={isVoting}
          style={{
            background: choice.color,
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "1rem 2rem",
            fontSize: "1.1rem",
            fontWeight: "600",
            cursor: isVoting ? "default" : "pointer",
            opacity: isVoting ? 0.6 : 1,
            transform: lastVoted === choice.id && !isVoting ? "scale(1.05)" : "scale(1)",
            transition: "all 0.2s ease",
            minWidth: "120px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
          onMouseOver={(e) => {
            if (!isVoting) {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
            }
          }}
          onMouseOut={(e) => {
            if (!isVoting) {
              e.currentTarget.style.transform = lastVoted === choice.id ? "scale(1.05)" : "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
            }
          }}
        >
          {isVoting && lastVoted === choice.id ? "Voting..." : `Vote ${choice.text}`}
        </button>
      ))}
    </div>
  );
}