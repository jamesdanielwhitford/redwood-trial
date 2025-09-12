import { RequestInfo } from "rwsdk/worker";
import { getPoll } from "./functions";
import { VoteButtons } from "./VoteButtons";
import { getPollVotes } from "./pollFunctions";

const Poll = async ({ params }: RequestInfo<{ pollId: string }>) => {
  const pollId = params.pollId;
  const poll = await getPoll(pollId);
  
  if (!poll) {
    return (
      <div style={{ 
        padding: "2rem", 
        textAlign: "center",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}>
        <h1>Poll Not Found</h1>
        <p>The poll you're looking for doesn't exist.</p>
        <a href="/" style={{
          background: "#007cba",
          color: "white",
          padding: "0.5rem 1rem",
          textDecoration: "none",
          borderRadius: "4px"
        }}>
          Go Home
        </a>
      </div>
    );
  }

  const votes = await getPollVotes(pollId);
  
  // Update choice votes from durable object
  const choicesWithVotes = poll.choices.map(choice => ({
    ...choice,
    votes: votes[choice.id] || 0
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
        marginBottom: "2rem", 
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
        <a href="/" style={{
          background: "#6c757d",
          color: "white",
          padding: "0.5rem 1rem",
          textDecoration: "none",
          borderRadius: "4px",
          fontSize: "0.9rem"
        }}>
          Create Your Own Poll
        </a>
      </div>
    </div>
  );
};

export default Poll;