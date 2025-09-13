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
      <div className="loading-container">
        Loading poll...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h1 className="error-title">Error</h1>
        <p className="error-message">{error}</p>
        <button
          onClick={onBack}
          className="poll-back-button"
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
    <div className="poll-page-container">
      <h1 className="poll-title">
        {poll.title}
      </h1>

      <p className="poll-subtitle">
        Vote and watch the results update live!
      </p>


      <div className="poll-choices-grid">
        {choicesWithVotes.map(choice => {
          const percentage = totalVotes > 0 ? Math.round((choice.votes / totalVotes) * 100) : 0;

          return (
            <div key={choice.id} className="poll-choice-card" style={{
              border: `3px solid ${choice.color}`
            }}>
              <h2 className="poll-choice-title" style={{
                color: choice.color
              }}>
                {choice.text}
              </h2>
              <div className="poll-choice-votes" style={{
                color: choice.color
              }}>
                {choice.votes}
              </div>
              <div className="poll-choice-percentage">
                {percentage}%
              </div>

              <div className="poll-progress-bar">
                <div className="poll-progress-fill" style={{
                  width: `${percentage}%`,
                  background: choice.color
                }} />
              </div>
            </div>
          );
        })}
      </div>
      
      <VoteButtons pollId={pollId} choices={choicesWithVotes} />
      
      <p className="poll-stats">
        Total votes: {totalVotes} • Results update live across all devices!
      </p>

      <div style={{ marginTop: "2rem" }}>
        <button
          onClick={onBack}
          className="poll-back-button"
          style={{
            marginRight: "1rem"
          }}
        >
          ← Back to Polls
        </button>
      </div>
    </div>
  );
}