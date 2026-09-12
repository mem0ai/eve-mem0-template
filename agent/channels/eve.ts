import { localDev, none, vercelOidc } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";

// The web chat is public by default so the template works the moment you deploy.
// Anyone with the URL can chat, and they share one memory space. Before using
// this for anything real, swap none() for an auth provider (Auth.js, Clerk,
// vercelOidc) so each user gets their own private memory (scoped by principalId).
export default eveChannel({
  auth: [
    // Lets the eve TUI and your own Vercel deployments reach the agent.
    vercelOidc(),
    // Open on localhost for `eve dev` and the REPL; ignored in production.
    localDev(),
    // Public: anyone with the deployment URL can chat.
    none(),
  ],
});
