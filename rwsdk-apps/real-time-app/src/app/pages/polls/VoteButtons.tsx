"use client";

import { useState, useTransition } from "react";

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
  const [isPending, startTransition] = useTransition();
  const [lastVoted, setLastVoted] = useState<string | null>(null);

  const handleVote = async (choiceId: string) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/poll/${pollId}/vote/${choiceId}`, {
          method: "POST"
        });

        if (response.ok) {
          setLastVoted(choiceId);
          // The page will reload automatically due to realtime updates
        }
      } catch (error) {
        console.error("Failed to vote:", error);
      }
    });
  };

  return (
    <div className="vote-buttons-container">
      {choices.map(choice => (
        <button
          key={choice.id}
          onClick={() => handleVote(choice.id)}
          disabled={isPending}
          className="vote-button"
          style={{
            background: choice.color,
            opacity: isPending ? 0.6 : 1,
            transform: lastVoted === choice.id ? "scale(1.05)" : "scale(1)"
          }}
          onMouseOver={(e) => {
            if (!isPending) {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
            }
          }}
          onMouseOut={(e) => {
            if (!isPending) {
              e.currentTarget.style.transform = lastVoted === choice.id ? "scale(1.05)" : "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
            }
          }}
        >
          {isPending && lastVoted === choice.id ? "Voting..." : `Vote ${choice.text}`}
        </button>
      ))}
    </div>
  );
}