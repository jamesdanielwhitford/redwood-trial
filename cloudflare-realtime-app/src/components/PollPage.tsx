import { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { VoteButtons } from './VoteButtons';

export interface Poll {
  id: string;
  title: string;
  created_at: string;
  choices: Choice[];
}

export interface Choice {
  id: string;
  text: string;
  color: string;
  votes: number;
}

interface PollPageProps {
  pollId: string;
  onBack: () => void;
}

export function PollPage({ pollId, onBack }: PollPageProps) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { votes } = useWebSocket(pollId);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await fetch(`/api/polls/${pollId}`);
        if (response.ok) {
          const pollData = await response.json();
          setPoll(pollData);
        } else if (response.status === 404) {
          setError("Poll not found");
        } else {
          setError("Failed to load poll");
        }
      } catch {
        setError("Error loading poll");
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [pollId]);

  if (loading) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}>
        Loading poll...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}>
        <h1>Error</h1>
        <p>{error}</p>
        <button
          onClick={onBack}
          style={{
            background: "#6c757d",
            color: "white",
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!poll) {
    return null;
  }

  // Update choice votes from durable object if available
  const choicesWithVotes = poll.choices.map(choice => ({
    ...choice,
    votes: votes?.[choice.id] ?? choice.votes
  }));

  const totalVotes = choicesWithVotes.reduce((sum, choice) => sum + choice.votes, 0);

  return (
    <div style={{ 
      textAlign: "center", 
      padding: "2rem", 
      fontFamily: "system-ui, -apple-system, sans-serif",
      maxWidth: "800px",
      margin: "0 auto"
    }}>
      <h1 style={{ 
        fontSize: "2.5rem", 
        marginBottom: "1rem", 
        color: "#333" 
      }}>
        {poll.title}
      </h1>
      
      <p style={{ 
        fontSize: "1.1rem", 
        marginBottom: "1rem", 
        color: "#666" 
      }}>
        Vote and watch the results update live!
      </p>

      
      <div style={{ 
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1.5rem", 
        marginBottom: "2rem"
      }}>
        {choicesWithVotes.map(choice => {
          const percentage = totalVotes > 0 ? Math.round((choice.votes / totalVotes) * 100) : 0;
          
          return (
            <div key={choice.id} style={{
              background: "#f8f9fa",
              border: `3px solid ${choice.color}`,
              borderRadius: "12px",
              padding: "1.5rem",
              position: "relative"
            }}>
              <h2 style={{ 
                fontSize: "1.3rem", 
                margin: "0 0 1rem 0", 
                color: choice.color,
                fontWeight: "600"
              }}>
                {choice.text}
              </h2>
              <div style={{ 
                fontSize: "2.5rem", 
                fontWeight: "bold", 
                color: choice.color,
                marginBottom: "0.5rem"
              }}>
                {choice.votes}
              </div>
              <div style={{ 
                fontSize: "1.1rem", 
                color: "#666",
                marginBottom: "1rem"
              }}>
                {percentage}%
              </div>
              
              {/* Progress bar */}
              <div style={{
                width: "100%",
                height: "8px",
                background: "#e9ecef",
                borderRadius: "4px",
                overflow: "hidden"
              }}>
                <div style={{
                  width: `${percentage}%`,
                  height: "100%",
                  background: choice.color,
                  transition: "width 0.3s ease"
                }} />
              </div>
            </div>
          );
        })}
      </div>
      
      <VoteButtons pollId={pollId} choices={choicesWithVotes} />
      
      <p style={{ 
        marginTop: "2rem", 
        color: "#999",
        fontSize: "0.9rem"
      }}>
        Total votes: {totalVotes} • Results update live across all devices!
      </p>
      
      <div style={{ marginTop: "2rem" }}>
        <button
          onClick={onBack}
          style={{
            background: "#6c757d",
            color: "white",
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "4px",
            fontSize: "0.9rem",
            cursor: "pointer",
            marginRight: "1rem"
          }}
        >
          ← Back to Polls
        </button>
      </div>
    </div>
  );
}