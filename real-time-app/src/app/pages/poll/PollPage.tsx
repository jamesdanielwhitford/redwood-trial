import { getPoll, PollWithChoices } from "./functions";
import { PollVoting } from "./PollVoting";
import { RequestInfo } from "rwsdk/worker";

const PollPage = async ({ params }: RequestInfo<{ pollId: string }>) => {
  const pollId = params.pollId;
  const poll = await getPoll(pollId);

  if (!poll) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "4rem", 
        fontFamily: "system-ui, -apple-system, sans-serif" 
      }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#666" }}>
          Poll Not Found
        </h1>
        <p style={{ marginBottom: "2rem", color: "#999" }}>
          The poll you're looking for doesn't exist or has been deleted.
        </p>
        <a 
          href="/" 
          style={{
            display: "inline-block",
            padding: "0.75rem 1.5rem",
            backgroundColor: "#4ECDC4",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "bold"
          }}
        >
          Go Home
        </a>
      </div>
    );
  }

  const totalVotes = poll.choices.reduce((sum, choice) => sum + choice.voteCount, 0);

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
        color: "#333",
        lineHeight: "1.2"
      }}>
        {poll.title}
      </h1>
      
      <p style={{ 
        fontSize: "1rem", 
        marginBottom: "3rem", 
        color: "#666" 
      }}>
        Vote for your choice and watch results update live!
      </p>
      
      <div style={{ 
        display: "grid",
        gridTemplateColumns: totalVotes > 0 && poll.choices.length <= 3 
          ? `repeat(${poll.choices.length}, 1fr)` 
          : "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1.5rem", 
        marginBottom: "3rem" 
      }}>
        {poll.choices.map((choice) => {
          const percentage = totalVotes > 0 ? Math.round((choice.voteCount / totalVotes) * 100) : 0;
          
          return (
            <div
              key={choice.id}
              style={{
                background: `linear-gradient(135deg, ${choice.color}15, ${choice.color}25)`,
                border: `3px solid ${choice.color}`,
                borderRadius: "16px",
                padding: "2rem 1.5rem",
                position: "relative",
                overflow: "hidden"
              }}
            >
              {/* Progress bar background */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: `${percentage}%`,
                  background: `linear-gradient(90deg, ${choice.color}20, ${choice.color}30)`,
                  transition: "width 0.5s ease-in-out",
                  zIndex: 0
                }}
              />
              
              {/* Content */}
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>
                  {choice.emoji}
                </div>
                <h3 style={{ 
                  fontSize: "1.4rem", 
                  margin: "0.5rem 0", 
                  color: choice.color,
                  fontWeight: "bold"
                }}>
                  {choice.text}
                </h3>
                <div style={{ 
                  fontSize: "2.5rem", 
                  fontWeight: "bold", 
                  color: choice.color,
                  marginBottom: "0.5rem"
                }}>
                  {choice.voteCount}
                </div>
                <div style={{ 
                  fontSize: "1.1rem", 
                  color: "#666",
                  fontWeight: "500"
                }}>
                  {percentage}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <PollVoting poll={poll} />
      
      <div style={{
        marginTop: "3rem",
        padding: "1.5rem",
        backgroundColor: "#f8f9fa",
        borderRadius: "12px",
        border: "1px solid #e9ecef"
      }}>
        <p style={{ 
          margin: "0", 
          color: "#6c757d",
          fontSize: "0.95rem"
        }}>
          <strong>Total votes:</strong> {totalVotes} • 
          <strong> Share this poll:</strong>{" "}
          <span style={{ 
            fontFamily: "monospace", 
            backgroundColor: "#e9ecef", 
            padding: "0.25rem 0.5rem", 
            borderRadius: "4px",
            fontSize: "0.85rem"
          }}>
            {typeof window !== "undefined" ? window.location.href : `/poll/${pollId}`}
          </span>
        </p>
        <p style={{ 
          margin: "0.5rem 0 0 0", 
          color: "#6c757d",
          fontSize: "0.85rem"
        }}>
          Results update live across all devices!
        </p>
      </div>
    </div>
  );
};

export default PollPage;