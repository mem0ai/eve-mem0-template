import { defineAgent } from "eve";

export default defineAgent({
  model: "openai/gpt-5.6-luna-fast",
  // Keep the agent focused on memory. eve's built-in default tools (bash, file
  // read/write, self-modification) are off, so the agent only has the two Mem0
  // tools under agent/tools/. Turn this on if you want those capabilities.
  defaultTools: false,
});
