import { RequestInfo } from "rwsdk/worker";
import { getUserPolls } from "./polls/functions";
import { PollForm } from "./polls/PollForm";

export async function Home({ ctx }: RequestInfo) {
  if (!ctx.user) {
    return (
      <div className="loading-container">
        <h1>Voting Polls</h1>
        <p>Please log in to create and manage your polls.</p>
        <a href="/user/login" className="login-link">
          Login
        </a>
      </div>
    );
  }

  const polls = await getUserPolls(ctx.user.id);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Your Voting Polls</h1>
        <a href="/user/logout" className="logout-link">
          Logout
        </a>
      </div>

      <p className="dashboard-description">
        Welcome, {ctx.user.username}! Create new voting polls and share them with others.
      </p>

      <PollForm />

      {polls.length > 0 ? (
        <div>
          <h2 style={{ marginTop: "3rem", marginBottom: "1rem" }}>Your Polls</h2>
          <div className="poll-list">
            {polls.map(poll => (
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
                <a
                  href={`/poll/${poll.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="poll-view-link"
                >
                  View Poll →
                </a>
              </div>
            ))}
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
