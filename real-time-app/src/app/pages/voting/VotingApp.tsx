import { getVotes } from "./functions";
import { VotingButtons } from "./VotingButtons";

const VotingApp = async () => {
  const votes = await getVotes();
  const totalVotes = votes.dog + votes.cat;
  const dogPercent = totalVotes > 0 ? Math.round((votes.dog / totalVotes) * 100) : 0;
  const catPercent = totalVotes > 0 ? Math.round((votes.cat / totalVotes) * 100) : 0;
  
  return (
    <div style={{ 
      textAlign: "center", 
      padding: "2rem", 
      fontFamily: "system-ui, -apple-system, sans-serif",
      maxWidth: "600px",
      margin: "0 auto"
    }}>
      <h1 style={{ 
        fontSize: "3rem", 
        marginBottom: "1rem", 
        color: "#333" 
      }}>
        🐕 vs 🐱 Live Vote!
      </h1>
      
      <p style={{ 
        fontSize: "1.2rem", 
        marginBottom: "2rem", 
        color: "#666" 
      }}>
        Which is better? Vote and watch the results update live!
      </p>
      
      <div style={{ 
        display: "flex", 
        gap: "2rem", 
        marginBottom: "2rem",
        justifyContent: "center"
      }}>
        {/* Dog Results */}
        <div style={{
          flex: 1,
          background: "#f0f8ff",
          border: "3px solid #4A90E2",
          borderRadius: "12px",
          padding: "1.5rem"
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>🐕</div>
          <h2 style={{ fontSize: "1.5rem", margin: "0.5rem 0", color: "#4A90E2" }}>
            Dogs
          </h2>
          <div style={{ fontSize: "3rem", fontWeight: "bold", color: "#4A90E2" }}>
            {votes.dog}
          </div>
          <div style={{ fontSize: "1.2rem", color: "#666" }}>
            {dogPercent}%
          </div>
        </div>
        
        {/* Cat Results */}
        <div style={{
          flex: 1,
          background: "#fff8f0",
          border: "3px solid #E2904A",
          borderRadius: "12px",
          padding: "1.5rem"
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>🐱</div>
          <h2 style={{ fontSize: "1.5rem", margin: "0.5rem 0", color: "#E2904A" }}>
            Cats
          </h2>
          <div style={{ fontSize: "3rem", fontWeight: "bold", color: "#E2904A" }}>
            {votes.cat}
          </div>
          <div style={{ fontSize: "1.2rem", color: "#666" }}>
            {catPercent}%
          </div>
        </div>
      </div>
      
      <VotingButtons />
      
      <p style={{ 
        marginTop: "2rem", 
        color: "#999",
        fontSize: "0.9rem"
      }}>
        Total votes: {totalVotes} • Results update live across all devices!
      </p>
    </div>
  );
};

export default VotingApp;