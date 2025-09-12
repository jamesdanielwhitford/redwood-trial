import { useState } from 'react';

export const VotingButtons = () => {
  const [isVoting, setIsVoting] = useState(false);
  const [lastVoteError, setLastVoteError] = useState<string | null>(null);

  const handleVote = async (voteType: 'dog' | 'cat') => {
    if (isVoting) return;
    
    setIsVoting(true);
    setLastVoteError(null);
    
    try {
      const response = await fetch(`/api/vote/${voteType}`, { 
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Vote successful - the WebSocket will handle updating the UI
      console.log(`Voted for ${voteType}!`);
      
    } catch (error) {
      console.error(`Error voting for ${voteType}:`, error);
      setLastVoteError(`Failed to vote for ${voteType}. Please try again.`);
    } finally {
      setIsVoting(false);
    }
  };

  const handleDogVote = () => handleVote('dog');
  const handleCatVote = () => handleVote('cat');

  return (
    <div>
      {lastVoteError && (
        <div style={{
          marginBottom: "1rem",
          padding: "0.5rem",
          backgroundColor: "#f8d7da",
          color: "#721c24",
          borderRadius: "4px",
          fontSize: "0.9rem"
        }}>
          {lastVoteError}
        </div>
      )}
      
      <div style={{ 
        display: "flex", 
        gap: "1rem", 
        justifyContent: "center",
        marginBottom: "1rem"
      }}>
        <button 
          onClick={handleCatVote}
          disabled={isVoting}
          style={{
            fontSize: "2rem",
            padding: "1rem 2rem",
            background: isVoting ? "#ccc" : "#E2904A",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: isVoting ? "not-allowed" : "pointer",
            minWidth: "120px",
            transition: "background-color 0.2s",
            opacity: isVoting ? 0.6 : 1
          }}
          onMouseOver={(e) => {
            if (!isVoting) {
              (e.target as HTMLButtonElement).style.backgroundColor = "#d17a3a";
            }
          }}
          onMouseOut={(e) => {
            if (!isVoting) {
              (e.target as HTMLButtonElement).style.backgroundColor = "#E2904A";
            }
          }}
        >
          🐱 Vote Cat
        </button>
        
        <button 
          onClick={handleDogVote}
          disabled={isVoting}
          style={{
            fontSize: "2rem",
            padding: "1rem 2rem",
            background: isVoting ? "#ccc" : "#4A90E2",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: isVoting ? "not-allowed" : "pointer",
            minWidth: "120px",
            transition: "background-color 0.2s",
            opacity: isVoting ? 0.6 : 1
          }}
          onMouseOver={(e) => {
            if (!isVoting) {
              (e.target as HTMLButtonElement).style.backgroundColor = "#3a7bc8";
            }
          }}
          onMouseOut={(e) => {
            if (!isVoting) {
              (e.target as HTMLButtonElement).style.backgroundColor = "#4A90E2";
            }
          }}
        >
          🐕 Vote Dog
        </button>
      </div>
      
      {isVoting && (
        <p style={{ 
          color: "#666", 
          fontSize: "0.9rem",
          fontStyle: "italic"
        }}>
          Submitting vote...
        </p>
      )}
    </div>
  );
};