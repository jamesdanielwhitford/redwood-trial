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
import Counter from "@/app/pages/counter/Counter";
export { SessionDurableObject } from "./session/durableObject";
export { RealtimeDurableObject } from "rwsdk/realtime/durableObject";
export { CounterDurableObject } from "@/counterDurableObject";

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
  route("/api/counter/increment", async ({ request }) => {
    if (request.method !== "POST") {
      return new Response(null, { status: 405 });
    }

    const doId = env.COUNTER_DURABLE_OBJECT.idFromName("global-counter");
    const counterDO = env.COUNTER_DURABLE_OBJECT.get(doId);
    await counterDO.increment();

    await renderRealtimeClients({
      durableObjectNamespace: env.REALTIME_DURABLE_OBJECT,
      key: "/counter",
    });

    return new Response(null, { status: 200 });
  }),
  route("/api/counter/decrement", async ({ request }) => {
    if (request.method !== "POST") {
      return new Response(null, { status: 405 });
    }

    const doId = env.COUNTER_DURABLE_OBJECT.idFromName("global-counter");
    const counterDO = env.COUNTER_DURABLE_OBJECT.get(doId);
    await counterDO.decrement();

    await renderRealtimeClients({
      durableObjectNamespace: env.REALTIME_DURABLE_OBJECT,
      key: "/counter",
    });

    return new Response(null, { status: 200 });
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
    route("/counter", Counter),
    prefix("/user", userRoutes),
  ]),
]);
