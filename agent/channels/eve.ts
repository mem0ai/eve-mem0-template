import { localDev, none, vercelOidc } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";

// Public demo: the hosted chat is open so anyone can try it. Spend is bounded by
// a per-visitor message limit in the UI and by the Azure deployment's own quota.
export default eveChannel({
  auth: [vercelOidc(), localDev(), none()],
});
