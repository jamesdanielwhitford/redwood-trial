import { useState, useEffect } from 'react';
import { PollForm } from './PollForm';

interface User {
  id: string;
  username: string;
  created_at: string;
}

interface Poll {
  id: string;
  title: string;
  created_at: string;
  choices: Array<{
    id: string;
    text: string;
    color: string;
    votes: number;
  }>;
}

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
  onNavigateToPoll: (pollId: string) => void;
}

export function UserDashboard({ user, onLogout, onNavigateToPoll }: UserDashboardProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPolls = async () => {
    try {
      const response = await fetch('/api/polls', {
        credentials: 'include'
      });
      if (response.ok) {
        const pollsData = await response.json();
        setPolls(pollsData);
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      onLogout(); // Logout anyway on error
    }
  };

  return (
    <div style={{
      padding: "2rem",
      maxWidth: "800px",
      margin: "0 auto",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem"
      }}>
        <h1 style={{ margin: 0 }}>Your Voting Polls</h1>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ color: "#666" }}>Welcome, {user.username}!</span>
          <button
            onClick={handleLogout}
            style={{
              background: "#dc3545",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              fontSize: "0.9rem",
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Create custom voting polls with multiple choices and colors. Share polls with others and watch results update in real-time!
      </p>

      <PollForm onPollCreated={fetchPolls} />

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
          Loading polls...
        </div>
      ) : polls.length > 0 ? (
        <div>
          <h2 style={{ marginTop: "3rem", marginBottom: "1rem" }}>Your Polls</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {polls.map(poll => {
              const totalVotes = poll.choices.reduce((sum, choice) => sum + choice.votes, 0);

              return (
                <div key={poll.id} style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "1rem",
                  background: "white"
                }}>
                  <h3 style={{ margin: "0 0 0.5rem 0", color: "#333" }}>
                    {poll.title}
                  </h3>
                  <div style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                    flexWrap: "wrap"
                  }}>
                    {poll.choices.map(choice => (
                      <span key={choice.id} style={{
                        background: choice.color,
                        color: "white",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "12px",
                        fontSize: "0.8rem",
                        fontWeight: "500"
                      }}>
                        {choice.text}: {choice.votes} votes
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <button
                      onClick={() => onNavigateToPoll(poll.id)}
                      style={{
                        background: "#007cba",
                        color: "white",
                        padding: "0.5rem 1rem",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "0.9rem",
                        cursor: "pointer"
                      }}
                    >
                      View & Vote →
                    </button>
                    <span style={{ color: "#666", fontSize: "0.9rem" }}>
                      {totalVotes} total votes
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: "center",
          padding: "2rem",
          color: "#666",
          marginTop: "2rem"
        }}>
          <p>You haven't created any polls yet. Use the form above to create your first poll!</p>
        </div>
      )}
    </div>
  );
}