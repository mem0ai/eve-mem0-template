import { createAzure } from "@ai-sdk/azure";
import { defineAgent } from "eve";

// Direct Azure OpenAI (not the paid AI Gateway) so the demo runs on your own
// Azure deployment. All values come from env vars — nothing is hard-coded.

// Accept either the bare resource name ("my-resource") or a full endpoint URL
// ("https://my-resource.openai.azure.com"); we always reduce it to the name.
function azureResourceName(): string | undefined {
  const raw = process.env.AZURE_RESOURCE_NAME?.trim();
  if (!raw) return undefined;
  const label = raw.replace(/^https?:\/\//i, "").split("/")[0].split(".")[0];
  return label || undefined;
}

const azure = createAzure({
  resourceName: azureResourceName(),
  apiKey: process.env.AZURE_API_KEY,
  apiVersion: process.env.AZURE_API_VERSION,
});

export default defineAgent({
  model: azure(process.env.AZURE_DEPLOYMENT ?? "gpt-4o-mini"),
  // SECURITY: public demo. Disable eve's built-in default tools (bash, file
  // read/write, self-modification) so a prompt injection can never run shell
  // or read env vars. Only the authored memory tools remain.
  defaultTools: false,
});
