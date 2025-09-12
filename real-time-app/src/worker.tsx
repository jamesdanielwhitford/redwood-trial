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
import VotingApp from "./app/pages/voting/VotingApp";
import { NewPoll } from "./app/pages/poll/NewPoll";
import PollPage from "./app/pages/poll/PollPage";
import { vote } from "./app/pages/poll/functions";
export { SessionDurableObject } from "./session/durableObject";
export { RealtimeDurableObject } from "rwsdk/realtime/durableObject";
export { VotingDurableObject } from "./votingDurableObject";

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
  route("/api/vote/dog", async ({ request }) => {
    if (request.method !== "POST") {
      return new Response(null, { status: 405 });
    }

    const doId = env.VOTING_DURABLE_OBJECT.idFromName("global-voting");
    const votingDO = env.VOTING_DURABLE_OBJECT.get(doId);
    await votingDO.voteDog();

    await renderRealtimeClients({
      durableObjectNamespace: env.REALTIME_DURABLE_OBJECT,
      key: "/voting",
    });

    return new Response(null, { status: 200 });
  }),
  route("/api/vote/cat", async ({ request }) => {
    if (request.method !== "POST") {
      return new Response(null, { status: 405 });
    }

    const doId = env.VOTING_DURABLE_OBJECT.idFromName("global-voting");
    const votingDO = env.VOTING_DURABLE_OBJECT.get(doId);
    await votingDO.voteCat();

    await renderRealtimeClients({
      durableObjectNamespace: env.REALTIME_DURABLE_OBJECT,
      key: "/voting",
    });

    return new Response(null, { status: 200 });
  }),
  route("/api/poll/:pollId/vote", async ({ request, params }) => {
    if (request.method !== "POST") {
      return new Response(null, { status: 405 });
    }

    try {
      const { choiceId, voterIdentifier } = await request.json();
      
      if (!choiceId || !voterIdentifier) {
        return new Response(JSON.stringify({ error: "Missing choiceId or voterIdentifier" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      await vote(choiceId, voterIdentifier);

      // Trigger real-time updates for this poll
      await renderRealtimeClients({
        durableObjectNamespace: env.REALTIME_DURABLE_OBJECT,
        key: `/poll/${params.pollId}`,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Vote error:", error);
      return new Response(JSON.stringify({ error: "Failed to vote" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
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
    route("/voting", VotingApp),
    route("/polls/new", [isAuthenticated, NewPoll]),
    route("/poll/:pollId", PollPage),
    prefix("/user", userRoutes),
  ]),
]);
