import { PollDurableObject } from "./durable-objects/PollDurableObject";
import { RealtimeDurableObject } from "./durable-objects/RealtimeDurableObject";
import { AuthService, type User } from "./services/auth";
import { generateId } from "./utils";

// Export Durable Objects
export { PollDurableObject, RealtimeDurableObject };

// Handle poll creation (requires authentication)
async function createPoll(request: Request, env: Env, user: User): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const data = await request.json() as {
      title: string;
      choices: Array<{ text: string; color: string }>;
    };

    if (!data.title || !data.choices || data.choices.length < 2) {
      return new Response("Invalid poll data", { status: 400 });
    }

    const pollId = generateId();
    const choices = data.choices.map(choice => ({
      id: generateId(),
      text: choice.text,
      color: choice.color,
      votes: 0
    }));

    // Save poll to database with user ownership
    await env.DB.prepare(`
      INSERT INTO polls (id, title, created_by) VALUES (?, ?, ?)
    `).bind(pollId, data.title, user.id).run();

    // Save choices to database
    for (const choice of choices) {
      await env.DB.prepare(`
        INSERT INTO choices (id, poll_id, text, color, votes) VALUES (?, ?, ?, ?, ?)
      `).bind(choice.id, pollId, choice.text, choice.color, choice.votes).run();
    }

    return Response.json({ id: pollId, title: data.title, choices });
  } catch (error) {
    console.error("Error creating poll:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

// Handle user registration
async function handleRegister(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response("Username and password required", { status: 400 });
    }

    const auth = new AuthService(env.DB);
    const result = await auth.register(username, password);

    if ('error' in result) {
      return new Response(result.error, { status: 400 });
    }

    // Create session
    const session = await auth.createSession(result.id);
    const cookie = auth.createSessionCookie(session.id);

    return new Response(JSON.stringify({ user: result }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookie
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    return new Response("Registration failed", { status: 500 });
  }
}

// Handle user login
async function handleLogin(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response("Username and password required", { status: 400 });
    }

    const auth = new AuthService(env.DB);
    const result = await auth.login(username, password);

    if ('error' in result) {
      return new Response(result.error, { status: 401 });
    }

    // Create session
    const session = await auth.createSession(result.id);
    const cookie = auth.createSessionCookie(session.id);

    return new Response(JSON.stringify({ user: result }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookie
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return new Response("Login failed", { status: 500 });
  }
}

// Handle user logout
async function handleLogout(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const auth = new AuthService(env.DB);
  const user = await auth.getUserFromCookie(request.headers.get("Cookie"));

  if (user) {
    // Delete session from database
    const cookies = parseCookies(request.headers.get("Cookie") || "");
    const sessionId = cookies.session_id;
    if (sessionId) {
      await auth.deleteSession(sessionId);
    }
  }

  const clearCookie = auth.clearSessionCookie();

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": clearCookie
    }
  });
}

// Helper to parse cookies
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
}

// Handle poll voting
async function handlePollVote(request: Request, env: Env, pollId: string, choiceId: string): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Get the poll-specific Durable Object
    const doId = env.POLL_DURABLE_OBJECT.idFromName(pollId);
    const pollObj = env.POLL_DURABLE_OBJECT.get(doId);

    // Cast vote using the durable object
    const voteResponse = await pollObj.fetch(new Request(`https://dummy.com/vote/${choiceId}`));
    const newVotes = await voteResponse.json();

    // Update database (increment vote count)
    await env.DB.prepare(`
      UPDATE choices SET votes = votes + 1 WHERE id = ?
    `).bind(choiceId).run();

    // Broadcast update to poll-specific realtime room
    const realtimeId = env.REALTIME_DURABLE_OBJECT.idFromName(`poll-${pollId}`);
    const realtimeObj = env.REALTIME_DURABLE_OBJECT.get(realtimeId);
    await realtimeObj.fetch(new Request("https://dummy.com/broadcast-vote-update", {
      method: "POST",
      body: JSON.stringify(newVotes),
      headers: { "Content-Type": "application/json" }
    }));

    return Response.json(newVotes);
  } catch (error) {
    console.error(`Error handling vote for poll ${pollId}:`, error);
    return new Response("Internal server error", { status: 500 });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const auth = new AuthService(env.DB);

    // Get current user from session
    const currentUser = await auth.getUserFromCookie(request.headers.get("Cookie"));

    // Handle poll-specific WebSocket upgrade
    if (url.pathname.startsWith("/ws/")) {
      const pollId = url.pathname.split("/ws/")[1];
      if (!pollId) {
        return new Response("Poll ID required for WebSocket", { status: 400 });
      }

      const realtimeId = env.REALTIME_DURABLE_OBJECT.idFromName(`poll-${pollId}`);
      const realtimeObj = env.REALTIME_DURABLE_OBJECT.get(realtimeId);
      return realtimeObj.fetch(new Request(`${request.url.replace(url.pathname, "/ws")}`, request));
    }

    // Authentication routes
    if (url.pathname === "/api/auth/register") {
      return handleRegister(request, env);
    }

    if (url.pathname === "/api/auth/login") {
      return handleLogin(request, env);
    }

    if (url.pathname === "/api/auth/logout") {
      return handleLogout(request, env);
    }

    // Get current user info
    if (url.pathname === "/api/auth/me" && request.method === "GET") {
      if (!currentUser) {
        return new Response("Unauthorized", { status: 401 });
      }
      return Response.json({ user: currentUser });
    }

    // Create new poll (requires authentication)
    if (url.pathname === "/api/polls" && request.method === "POST") {
      if (!currentUser) {
        return new Response("Authentication required", { status: 401 });
      }
      return createPoll(request, env, currentUser);
    }

    // Get user's polls (requires authentication)
    if (url.pathname === "/api/polls" && request.method === "GET") {
      if (!currentUser) {
        return new Response("Authentication required", { status: 401 });
      }
      try {
        const result = await env.DB.prepare(`
          SELECT p.id, p.title, p.created_at,
                 c.id as choice_id, c.text as choice_text, c.color as choice_color, c.votes as choice_votes
          FROM polls p
          LEFT JOIN choices c ON p.id = c.poll_id
          WHERE p.created_by = ?
          ORDER BY p.created_at DESC, c.id
        `).bind(currentUser.id).all();

        const pollsMap = new Map();
        
        for (const row of result.results) {
          const poll = pollsMap.get(row.id) || {
            id: row.id,
            title: row.title,
            created_at: row.created_at,
            choices: []
          };
          
          if (row.choice_id) {
            poll.choices.push({
              id: row.choice_id,
              text: row.choice_text,
              color: row.choice_color,
              votes: row.choice_votes
            });
          }
          
          pollsMap.set(row.id, poll);
        }

        return Response.json(Array.from(pollsMap.values()));
      } catch (error) {
        console.error("Error getting polls:", error);
        return new Response("Internal server error", { status: 500 });
      }
    }

    // Get specific poll
    if (url.pathname.match(/^\/api\/polls\/[^\/]+$/)) {
      const pollId = url.pathname.split("/api/polls/")[1];
      
      try {
        const result = await env.DB.prepare(`
          SELECT p.id, p.title, p.created_at,
                 c.id as choice_id, c.text as choice_text, c.color as choice_color, c.votes as choice_votes
          FROM polls p
          LEFT JOIN choices c ON p.id = c.poll_id
          WHERE p.id = ?
          ORDER BY c.id
        `).bind(pollId).all();

        if (result.results.length === 0) {
          return new Response("Poll not found", { status: 404 });
        }

        const poll = {
          id: result.results[0].id,
          title: result.results[0].title,
          created_at: result.results[0].created_at,
          choices: result.results
            .filter(row => row.choice_id)
            .map(row => ({
              id: row.choice_id,
              text: row.choice_text,
              color: row.choice_color,
              votes: row.choice_votes
            }))
        };

        return Response.json(poll);
      } catch (error) {
        console.error("Error getting poll:", error);
        return new Response("Internal server error", { status: 500 });
      }
    }

    // Vote on a poll choice
    if (url.pathname.match(/^\/api\/polls\/[^\/]+\/vote\/[^\/]+$/)) {
      const pathParts = url.pathname.split("/");
      const pollId = pathParts[3];
      const choiceId = pathParts[5];
      
      return handlePollVote(request, env, pollId, choiceId);
    }

    // Health check endpoint
    if (url.pathname === "/api/health") {
      return Response.json({ 
        status: "healthy", 
        timestamp: Date.now(),
        version: "2.0.0-polls"
      });
    }

    // All other routes return 404 (React app will be served by assets)
    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
