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
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Your Voting Polls</h1>
        <div className="dashboard-user-info">
          <span className="dashboard-username">Welcome, {user.username}!</span>
          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </div>
      </div>

      <p className="dashboard-description">
        Create custom voting polls with multiple choices and colors. Share polls with others and watch results update in real-time!
      </p>

      <PollForm onPollCreated={fetchPolls} />

      {loading ? (
        <div className="centered-content">
          Loading polls...
        </div>
      ) : polls.length > 0 ? (
        <div>
          <h2 style={{ marginTop: "3rem", marginBottom: "1rem" }}>Your Polls</h2>
          <div className="poll-list">
            {polls.map(poll => {
              const totalVotes = poll.choices.reduce((sum, choice) => sum + choice.votes, 0);

              return (
                <div key={poll.id} className="poll-list-item">
                  <h3 className="poll-list-title">
                    {poll.title}
                  </h3>
                  <div className="poll-choices-preview">
                    {poll.choices.map(choice => (
                      <span key={choice.id} className="poll-choice-tag" style={{
                        background: choice.color
                      }}>
                        {choice.text}: {choice.votes} votes
                      </span>
                    ))}
                  </div>
                  <div className="poll-actions">
                    <button
                      onClick={() => onNavigateToPoll(poll.id)}
                      className="poll-view-button"
                    >
                      View & Vote →
                    </button>
                    <span className="poll-vote-count">
                      {totalVotes} total votes
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="centered-content">
          <p>You haven't created any polls yet. Use the form above to create your first poll!</p>
        </div>
      )}
    </div>
  );
}