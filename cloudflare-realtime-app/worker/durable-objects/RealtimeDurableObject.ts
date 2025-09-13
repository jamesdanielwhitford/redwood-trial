import { DurableObject } from 'cloudflare:workers';
import { PollVoteData } from './PollDurableObject';

interface SessionData {
  id: string;
  connectedAt: number;
  pollId?: string;
}

export class RealtimeDurableObject extends DurableObject {
  sessions: Map<WebSocket, SessionData>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sessions = new Map();

    // Restore hibernating WebSocket connections
    this.ctx.getWebSockets().forEach((ws) => {
      const attachment = ws.deserializeAttachment();
      if (attachment) {
        this.sessions.set(ws, attachment as SessionData);
      }
    });

    // Set up auto-response for WebSocket ping/pong
    this.ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair("ping", "pong")
    );
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/ws") {
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("Expected Upgrade: websocket", { status: 426 });
      }

      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);

      // Accept WebSocket with hibernation support
      this.ctx.acceptWebSocket(server);

      const sessionId = crypto.randomUUID();
      const sessionData: SessionData = {
        id: sessionId,
        connectedAt: Date.now()
      };

      // Serialize attachment for hibernation
      server.serializeAttachment(sessionData);
      this.sessions.set(server, sessionData);

      // Send welcome message
      server.send(JSON.stringify({
        type: "connected",
        sessionId: sessionId,
        timestamp: Date.now()
      }));

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    if (url.pathname === "/broadcast") {
      // Endpoint to broadcast messages to all connected clients
      const message = await request.text();
      this.broadcast(message);
      return new Response("Broadcasted");
    }

    if (url.pathname === "/broadcast-vote-update") {
      // Handle poll vote update broadcasts
      const voteData = await request.json() as PollVoteData;
      this.broadcastVoteUpdate(voteData);
      return new Response("Vote update broadcasted");
    }

    return new Response("Not Found", { status: 404 });
  }

  async webSocketMessage(ws: WebSocket, message: string): Promise<void> {
    try {
      const data = JSON.parse(message);
      const session = this.sessions.get(ws);
      
      if (!session) {
        ws.send(JSON.stringify({ type: "error", message: "Session not found" }));
        return;
      }

      // Handle different message types
      switch (data.type) {
        case "ping":
          ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
          break;
          
        case "join-room":
          // For room-based features (future enhancement)
          ws.send(JSON.stringify({ 
            type: "joined-room", 
            room: data.room,
            sessionId: session.id 
          }));
          break;
          
        default:
          ws.send(JSON.stringify({ 
            type: "error", 
            message: `Unknown message type: ${data.type}` 
          }));
      }
    } catch (error) {
      ws.send(JSON.stringify({ 
        type: "error", 
        message: "Invalid JSON message" 
      }));
    }
  }

  async webSocketClose(ws: WebSocket, _code: number, _reason: string, _wasClean: boolean): Promise<void> {
    this.sessions.delete(ws);
  }

  async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
    console.error("WebSocket error:", error);
    this.sessions.delete(ws);
  }

  // Broadcast message to all connected clients
  broadcast(message: string): void {
    this.ctx.getWebSockets().forEach((ws) => {
      try {
        ws.send(message);
      } catch (error) {
        console.error("Error broadcasting to WebSocket:", error);
      }
    });
  }

  // Get current connection count
  getConnectionCount(): number {
    return this.ctx.getWebSockets().length;
  }

  // Broadcast poll vote update to all connected clients
  broadcastVoteUpdate(votes: PollVoteData): void {
    const message = JSON.stringify({
      type: "poll-vote-update",
      votes: votes,
      timestamp: Date.now()
    });
    
    this.broadcast(message);
  }
}