import { RequestInfo } from "rwsdk/worker";
import { getPoll } from "./functions";
import { VoteButtons } from "./VoteButtons";
import { getPollVotes } from "./pollFunctions";

const Poll = async ({ params }: RequestInfo<{ pollId: string }>) => {
  const pollId = params.pollId;
  const poll = await getPoll(pollId);
  
  if (!poll) {
    return (
      <div className="error-container">
        <h1 className="error-title">Poll Not Found</h1>
        <p className="error-message">The poll you're looking for doesn't exist.</p>
        <a href="/" className="login-link">
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
        <a href="/" className="poll-back-link">
          Create Your Own Poll
        </a>
      </div>
    </div>
  );
};

export default Poll;