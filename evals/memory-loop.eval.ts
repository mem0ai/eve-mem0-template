import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

// End-to-end: the agent saves a fact in one session and recalls it in a brand
// new session. Mem0 extracts and indexes memories asynchronously, so we wait
// before recalling. Tagged `slow` because of that wait and the extra turns;
// exclude it in fast CI with `eve eval --exclude-tag slow`.
export default defineEval({
  description: "Saves a fact in one session and recalls it in another.",
  tags: ["slow"],
  timeoutMs: 60_000,
  async test(t) {
    // 1) Tell the agent something durable. It should call `remember`.
    const saved = await t.send(
      "Please remember that I'm vegetarian and allergic to peanuts.",
    );
    saved.expectOk();
    saved.calledTool("remember");

    // 2) Give Mem0 time to extract and index the memory.
    await t.sleep(15_000);

    // 3) In a new session, ask something that needs the saved fact.
    const s2 = t.newSession();
    const recall = await s2.send(
      "What foods should you avoid recommending to me?",
    );
    recall.expectOk();
    recall.calledTool("recall_memories");

    // The reply reflects the remembered fact.
    t.check(recall.message, includes(/peanut|nut|vegetarian/i));
  },
});
