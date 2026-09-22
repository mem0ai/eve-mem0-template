import { defineTool } from "eve/tools";
import { z } from "zod";
import { getMem0, memoryUserId } from "../lib/mem0";

export default defineTool({
  description:
    "List every long-term memory stored for the user. Call this when the user asks to see " +
    "everything you remember about them (e.g. \"show me all my memories\").",
  inputSchema: z.object({}),
  label: { start: () => "List all memories" },
  async execute(_input, ctx) {
    const userId = memoryUserId(ctx.session.auth.current?.principalId);
    const res = (await getMem0().getAll({ filters: { user_id: userId } })) as unknown;

    // getAll returns a { results: Memory[] } page; tolerate a bare array too.
    const items = Array.isArray(res) ? res : ((res as { results?: unknown[] }).results ?? []);
    const memories = (items as Array<{ memory?: string }>)
      .map((item) => item.memory)
      .filter((memory): memory is string => Boolean(memory));

    return { memories };
  },
});
