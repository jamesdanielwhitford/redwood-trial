import { route } from "rwsdk/router";
import { Login } from "./Login";
import { sessions } from "@/session/store";

export const userRoutes = [
  route("/login", [Login]),
  route("/login-success", async function ({ request }) {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    
    if (!userId) {
      const headers = new Headers();
      headers.set("Location", "/user/login");
      return new Response(null, { status: 302, headers });
    }

    const headers = new Headers();
    await sessions.save(headers, { userId, challenge: null });
    headers.set("Location", "/");

    return new Response(null, {
      status: 302,
      headers,
    });
  }),
  route("/logout", async function ({ request }) {
    const headers = new Headers();
    await sessions.remove(request, headers);
    headers.set("Location", "/");

    return new Response(null, {
      status: 302,
      headers,
    });
  }),
];
