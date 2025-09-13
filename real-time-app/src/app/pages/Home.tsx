import { RequestInfo } from "rwsdk/worker";
import { getUserPolls } from "./polls/functions";
import { PollForm } from "./polls/PollForm";

export async function Home({ ctx }: RequestInfo) {
  if (!ctx.user) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Voting Polls</h1>
        <p>Please log in to create and manage your polls.</p>
        <a href="/user/login" style={{ 
          background: "#007cba", 
          color: "white", 
          padding: "0.5rem 1rem", 
          textDecoration: "none", 
          borderRadius: "4px" 
        }}>
          Login
        </a>
      </div>
    );
  }

  const polls = await getUserPolls(ctx.user.id);

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
        <a href="/user/logout" style={{ 
          background: "#dc3545", 
          color: "white", 
          padding: "0.5rem 1rem", 
          textDecoration: "none", 
          borderRadius: "4px",
          fontSize: "0.9rem"
        }}>
          Logout
        </a>
      </div>
      
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Welcome, {ctx.user.username}! Create new voting polls and share them with others.
      </p>

      <PollForm />

      {polls.length > 0 ? (
        <div>
          <h2 style={{ marginTop: "3rem", marginBottom: "1rem" }}>Your Polls</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {polls.map(poll => (
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
                <a 
                  href={`/poll/${poll.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "#007cba",
                    color: "white",
                    padding: "0.5rem 1rem",
                    textDecoration: "none",
                    borderRadius: "4px",
                    fontSize: "0.9rem",
                    display: "inline-block"
                  }}
                >
                  View Poll →
                </a>
              </div>
            ))}
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
