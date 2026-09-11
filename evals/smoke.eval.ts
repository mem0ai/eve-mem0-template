import { defineEval } from "eve/evals";

// Deterministic wiring check: both Mem0 tools run against the real API without
// erroring. It does not depend on Mem0's asynchronous extraction, so it is a
// reliable CI gate. The full remember-then-recall loop lives in
// `memory-loop.eval.ts` (tagged `slow`).
export default defineEval({
  description: "The agent calls both Mem0 tools and neither errors.",
  async test(t) {
    // Sharing a durable fact should trigger the `remember` tool.
    const saved = await t.send(
      "Remember that my name is Alex and I prefer TypeScript.",
    );
    saved.expectOk();
    saved.calledTool("remember");

    // Asking about known context should trigger the `recall_memories` tool.
    const asked = await t.send(
      "Look up what you already know about my language preference.",
    );
    asked.expectOk();
    asked.calledTool("recall_memories");

    // Neither tool call hit the Mem0 API and failed (bad key, bad wiring, etc.).
    t.noFailedActions();
  },
});
