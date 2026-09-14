import { type AuthFn, localDev, none, vercelOidc } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";

// Per-visitor anonymous identity (demo-only). The client sets a random cookie on
// first load; we read it here and use it as the principal. Same Mem0 key, but
// each visitor gets their own user_id, so memories stay isolated per visitor
// (no mixing) with no login. Falls through to none() so the demo stays public.
function anonCookie(): AuthFn<Request> {
  return async (request) => {
    const cookie = request.headers.get("cookie") ?? "";
    const raw = /(?:^|;\s*)mem0_demo_uid=([^;]+)/.exec(cookie)?.[1];
    if (!raw) return null;
    const id = `anon:${decodeURIComponent(raw)}`;
    return {
      principalId: id,
      principalType: "user",
      authenticator: "anon-demo",
      issuer: "demo",
      subject: id,
      attributes: {},
    };
  };
}

export default eveChannel({
  auth: [vercelOidc(), localDev(), anonCookie(), none()],
});
