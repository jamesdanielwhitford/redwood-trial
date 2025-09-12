import { RequestInfo } from "rwsdk/worker";
import { getUserPolls } from "./poll/functions";

export async function Home({ ctx }: RequestInfo) {
  if (!ctx.user) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "4rem", 
        fontFamily: "system-ui, -apple-system, sans-serif" 
      }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem", color: "#333" }}>
          🗳️ Real-Time Voting
        </h1>
        <p style={{ fontSize: "1.2rem", marginBottom: "2rem", color: "#666" }}>
          Create polls and watch votes come in live!
        </p>
        <a 
          href="/user/login" 
          style={{
            display: "inline-block",
            padding: "1rem 2rem",
            backgroundColor: "#4ECDC4",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontSize: "1.1rem",
            fontWeight: "bold"
          }}
        >
          Login to Get Started
        </a>
      </div>
    );
  }

  const userPolls = await getUserPolls(ctx.user.id);

  return (
    <div style={{ 
      maxWidth: "1000px", 
      margin: "0 auto", 
      padding: "2rem", 
      fontFamily: "system-ui, -apple-system, sans-serif" 
    }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "0.5rem", color: "#333" }}>
          🗳️ Your Polls
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#666", marginBottom: "2rem" }}>
          Welcome back, <strong>{ctx.user.username}</strong>!
        </p>
        
        <a 
          href="/polls/new" 
          style={{
            display: "inline-block",
            padding: "1rem 2rem",
            backgroundColor: "#4ECDC4",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontSize: "1.1rem",
            fontWeight: "bold",
            marginBottom: "2rem"
          }}
        >
          + Create New Poll
        </a>
      </div>

      {userPolls.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "3rem", 
          backgroundColor: "#f8f9fa", 
          borderRadius: "12px",
          border: "2px dashed #dee2e6"
        }}>
          <p style={{ fontSize: "1.2rem", color: "#666", marginBottom: "1rem" }}>
            You haven't created any polls yet.
          </p>
          <p style={{ color: "#999" }}>
            Create your first poll to get started!
          </p>
        </div>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
          gap: "1.5rem" 
        }}>
          {userPolls.map((poll) => {
            const totalVotes = poll.choices.reduce((sum, choice) => sum + choice._count.votes, 0);
            const createdAt = new Date(poll.createdAt).toLocaleDateString();
            
            return (
              <div
                key={poll.id}
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e9ecef",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }}
              >
                <h3 style={{ 
                  fontSize: "1.3rem", 
                  marginBottom: "1rem", 
                  color: "#333",
                  lineHeight: "1.3"
                }}>
                  {poll.title}
                </h3>
                
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ 
                    display: "flex", 
                    flexWrap: "wrap", 
                    gap: "0.5rem",
                    marginBottom: "0.75rem"
                  }}>
                    {poll.choices.slice(0, 4).map((choice) => (
                      <span
                        key={choice.id}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          padding: "0.25rem 0.5rem",
                          backgroundColor: choice.color + "20",
                          color: choice.color,
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                          fontWeight: "500"
                        }}
                      >
                        {choice.emoji} {choice.text}
                      </span>
                    ))}
                    {poll.choices.length > 4 && (
                      <span style={{
                        padding: "0.25rem 0.5rem",
                        backgroundColor: "#f8f9fa",
                        color: "#666",
                        borderRadius: "12px",
                        fontSize: "0.8rem"
                      }}>
                        +{poll.choices.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  marginBottom: "1rem",
                  padding: "0.75rem",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px"
                }}>
                  <span style={{ fontSize: "0.9rem", color: "#666" }}>
                    <strong>{totalVotes}</strong> total votes
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#999" }}>
                    Created {createdAt}
                  </span>
                </div>
                
                <a 
                  href={`/poll/${poll.id}`}
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "0.75rem",
                    backgroundColor: "#4ECDC4",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "6px",
                    fontWeight: "500",
                    fontSize: "0.95rem"
                  }}
                >
                  View Poll & Results
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
