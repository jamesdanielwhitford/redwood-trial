import { defineApp, ErrorResponse } from "rwsdk/worker";
import { index, route, render, prefix } from "rwsdk/router";
import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";
import { setCommonHeaders } from "@/app/headers";
import { userRoutes } from "@/app/pages/user/routes";
import { sessions, setupSessionStore } from "./session/store";
import { Session } from "./session/durableObject";
import { type User, db, setupDb } from "@/db";
import { env } from "cloudflare:workers";
import { realtimeRoute, renderRealtimeClients } from "rwsdk/realtime/worker";
import { createPoll } from "./app/pages/polls/functions";
import Poll from "./app/pages/polls/Poll";
export { SessionDurableObject } from "./session/durableObject";
export { RealtimeDurableObject } from "rwsdk/realtime/durableObject";
export { PollDurableObject } from "./pollDurableObject";

export type AppContext = {
  session: Session | null;
  user: User | null;
};

const isAuthenticated = ({ ctx }: { ctx: AppContext}) => {
  if (!ctx.user) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/user/login" },
    });
  }
}

export default defineApp([
  setCommonHeaders(),
  realtimeRoute(() => env.REALTIME_DURABLE_OBJECT),
  async ({ ctx, request, headers }) => {
    await setupDb(env);
    setupSessionStore(env);

    try {
      ctx.session = await sessions.load(request);
    } catch (error) {
      if (error instanceof ErrorResponse && error.code === 401) {
        await sessions.remove(request, headers);
        headers.set("Location", "/user/login");

        return new Response(null, {
          status: 302,
          headers,
        });
      }

      throw error;
    }

    if (ctx.session?.userId) {
      ctx.user = await db.user.findUnique({
        where: {
          id: ctx.session.userId,
        },
      });
    }
  },
  route("/api/poll/create", async ({ request, ctx }) => {
    if (request.method !== "POST") {
      return new Response(null, { status: 405 });
    }

    if (!ctx.user) {
      return new Response(null, { status: 401 });
    }

    try {
      const data = await request.json();
      await createPoll(ctx.user.id, data);
      return new Response(JSON.stringify({ success: true }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to create poll" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }),
  route("/api/poll/:pollId/vote/:choiceId", async ({ request, params }) => {
    if (request.method !== "POST") {
      return new Response(null, { status: 405 });
    }

    const { pollId, choiceId } = params as { pollId: string; choiceId: string };

    try {
      const doId = env.POLL_DURABLE_OBJECT.idFromName(pollId);
      const pollDO = env.POLL_DURABLE_OBJECT.get(doId);
      await pollDO.vote(choiceId);

      await renderRealtimeClients({
        durableObjectNamespace: env.REALTIME_DURABLE_OBJECT,
        key: `/poll/${pollId}`,
      });

      return new Response(null, { status: 200 });
    } catch (error) {
      return new Response(null, { status: 500 });
    }
  }),
  render(Document, [
    index([isAuthenticated, Home]),
    route("/protected", [
      ({ ctx }) => {
        if (!ctx.user) {
          return new Response(null, {
            status: 302,
            headers: { Location: "/user/login" },
          });
        }
      },
      Home,
    ]),
    route("/poll/:pollId", Poll),
    prefix("/user", userRoutes),
  ]),
]);
