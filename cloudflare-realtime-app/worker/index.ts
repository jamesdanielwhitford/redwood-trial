import { VotingDurableObject } from "./durable-objects/VotingDurableObject";
import { RealtimeDurableObject } from "./durable-objects/RealtimeDurableObject";

// Export Durable Objects
export { VotingDurableObject, RealtimeDurableObject };

async function handleVote(request: Request, env: Env, voteType: "dog" | "cat"): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Get the voting Durable Object
    const votingId = env.VOTING_DURABLE_OBJECT.idFromName("global-voting");
    const votingObj = env.VOTING_DURABLE_OBJECT.get(votingId);

    // Cast vote using fetch request
    const voteResponse = await votingObj.fetch(new Request(`https://dummy.com/${voteType === "dog" ? "vote-dog" : "vote-cat"}`));
    const newVotes = await voteResponse.json();

    // Broadcast update to all connected clients
    const realtimeId = env.REALTIME_DURABLE_OBJECT.idFromName("global-realtime");
    const realtimeObj = env.REALTIME_DURABLE_OBJECT.get(realtimeId);
    await realtimeObj.fetch(new Request("https://dummy.com/broadcast-vote-update", {
      method: "POST",
      body: JSON.stringify(newVotes),
      headers: { "Content-Type": "application/json" }
    }));

    return Response.json(newVotes);
  } catch (error) {
    console.error(`Error handling ${voteType} vote:`, error);
    return new Response("Internal server error", { status: 500 });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle WebSocket upgrade
    if (url.pathname === "/ws") {
      const realtimeId = env.REALTIME_DURABLE_OBJECT.idFromName("global-realtime");
      const realtimeObj = env.REALTIME_DURABLE_OBJECT.get(realtimeId);
      return realtimeObj.fetch(request);
    }

    // Handle vote endpoints
    if (url.pathname === "/api/vote/dog") {
      return handleVote(request, env, "dog");
    }

    if (url.pathname === "/api/vote/cat") {
      return handleVote(request, env, "cat");
    }

    // Handle get votes endpoint
    if (url.pathname === "/api/votes") {
      if (request.method !== "GET") {
        return new Response("Method not allowed", { status: 405 });
      }

      try {
        const votingId = env.VOTING_DURABLE_OBJECT.idFromName("global-voting");
        const votingObj = env.VOTING_DURABLE_OBJECT.get(votingId);
        const votesResponse = await votingObj.fetch(new Request("https://dummy.com/get-votes"));
        const votes = await votesResponse.json();
        return Response.json(votes);
      } catch (error) {
        console.error("Error getting votes:", error);
        return new Response("Internal server error", { status: 500 });
      }
    }

    // Handle reset votes endpoint (for testing)
    if (url.pathname === "/api/votes/reset") {
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }

      try {
        const votingId = env.VOTING_DURABLE_OBJECT.idFromName("global-voting");
        const votingObj = env.VOTING_DURABLE_OBJECT.get(votingId);
        const resetResponse = await votingObj.fetch(new Request("https://dummy.com/reset-votes"));
        const votes = await resetResponse.json();

        // Broadcast reset to all connected clients
        const realtimeId = env.REALTIME_DURABLE_OBJECT.idFromName("global-realtime");
        const realtimeObj = env.REALTIME_DURABLE_OBJECT.get(realtimeId);
        await realtimeObj.fetch(new Request("https://dummy.com/broadcast-vote-update", {
          method: "POST",
          body: JSON.stringify(votes),
          headers: { "Content-Type": "application/json" }
        }));

        return Response.json(votes);
      } catch (error) {
        console.error("Error resetting votes:", error);
        return new Response("Internal server error", { status: 500 });
      }
    }

    // Health check endpoint
    if (url.pathname === "/api/health") {
      return Response.json({ 
        status: "healthy", 
        timestamp: Date.now(),
        version: "1.0.0"
      });
    }

    // All other routes return 404 (React app will be served by assets)
    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
