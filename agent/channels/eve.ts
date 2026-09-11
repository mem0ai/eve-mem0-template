import { localDev, none, vercelOidc } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";

// This template accepts anonymous traffic so the deployed demo is clickable in
// production. The deployment itself is gated by Vercel deployment protection.
// Swap `none()` for a real provider (Auth.js, Clerk, `vercelOidc()`, ...) before
// exposing the agent publicly.
export default eveChannel({
  auth: [
    // Lets the eve TUI and your Vercel deployments reach the deployed agent.
    vercelOidc(),
    // Open on localhost for `eve dev` and the REPL; ignored in production.
    localDev(),
    // Public demo: anyone with the deployment URL can chat with the agent.
    none(),
  ],
});
