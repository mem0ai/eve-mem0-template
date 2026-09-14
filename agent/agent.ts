import { createAzure } from "@ai-sdk/azure";
import { defineAgent } from "eve";

// Direct Azure OpenAI (not the paid AI Gateway) so the demo runs on your own
// Azure deployment. All values come from env vars — set them in .env locally and
// in the Vercel project. Nothing is hard-coded.
const azure = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME,
  apiKey: process.env.AZURE_API_KEY,
  apiVersion: process.env.AZURE_API_VERSION,
});

export default defineAgent({
  model: azure(process.env.AZURE_DEPLOYMENT ?? "gpt-4o-mini"),
});
