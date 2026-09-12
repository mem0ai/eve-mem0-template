import { localDev, none, vercelOidc } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";

// DEMO BRANCH ONLY. This channel is public (`none()`) so the hosted demo is
// clickable in production. Everyone shares one memory bucket here, which is fine
// for a throwaway demo. The `main` branch ships `placeholderAuth()`, the safe
// default for anyone who forks this template into a real app.
export default eveChannel({
  auth: [
    // Lets the eve TUI and your own Vercel deployments reach the agent.
    vercelOidc(),
    // Open on localhost for `eve dev` and the REPL; ignored in production.
    localDev(),
    // Public demo: anyone with the deployment URL can chat with the agent.
    none(),
  ],
});
