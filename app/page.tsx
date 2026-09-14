"use client";

import { useEveAgent } from "eve/react";
import { type CSSProperties, useEffect, useState } from "react";

// Per-visitor message cap (client-side). Bounds demo spend together with the
// Azure deployment's own quota. Soft by design — it's a demo, not a paywall.
const MESSAGE_LIMIT = 12;
const COUNT_KEY = "mem0-demo-count";

function readCount(): number {
  try {
    return Number(localStorage.getItem(COUNT_KEY) ?? "0") || 0;
  } catch {
    return 0;
  }
}

function bumpCount(): number {
  try {
    const next = readCount() + 1;
    localStorage.setItem(COUNT_KEY, String(next));
    return next;
  } catch {
    return 0;
  }
}

type Part = {
  readonly type: string;
  readonly text?: string;
  readonly toolName?: string;
  readonly state?: string;
  readonly input?: { readonly content?: string; readonly query?: string };
  readonly output?: { readonly memories?: readonly string[] };
};
type Message = { readonly id: string; readonly role: string; readonly parts: readonly Part[] };

// Pull the tool name + args + result out of a message part, whether eve emits it
// as a typed "tool-<name>" part or a generic "dynamic-tool" part.
function toolInfo(part: Part): { name: string; input: Part["input"]; output: Part["output"] } | null {
  if (part.type.startsWith("tool-")) return { name: part.type.slice(5), input: part.input, output: part.output };
  if (part.type === "dynamic-tool" && part.toolName) return { name: part.toolName, input: part.input, output: part.output };
  return null;
}

// The line that makes this a Mem0 demo: shows memory being written and read.
function memoryLine(name: string, input: Part["input"], output: Part["output"]): string {
  const hasOutput = output !== undefined && output !== null;
  if (name === "remember") {
    const content = input?.content;
    return `💾 ${hasOutput ? "Saved to memory" : "Saving to memory"}${content ? `: “${content}”` : ""}`;
  }
  if (name === "recall_memories") {
    const query = input?.query;
    const memories = Array.isArray(output?.memories) ? output.memories : [];
    if (!hasOutput) return `🔎 Searching memory${query ? ` for “${query}”` : ""}…`;
    return memories.length > 0
      ? `🔎 Recalled from memory: ${memories.join(" · ")}`
      : `🔎 Searched memory${query ? ` for “${query}”` : ""} — nothing stored yet`;
  }
  return `🔧 ${name}`;
}

// Give each browser a stable random id (cookie), sent with every request so the
// server-side anonCookie() auth scopes this visitor's memory to their own bucket.
function ensureAnonId(): string {
  if (typeof document === "undefined") return "";
  const existing = /(?:^|;\s*)mem0_demo_uid=([^;]+)/.exec(document.cookie)?.[1];
  if (existing) return decodeURIComponent(existing);
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  document.cookie = `mem0_demo_uid=${id}; path=/; max-age=31536000; samesite=lax`;
  return id;
}

export default function Page() {
  // Runs once, synchronously, before the agent connects — sets the cookie first.
  useState(ensureAnonId);
  const agent = useEveAgent();
  const [input, setInput] = useState("");
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(readCount());
  }, []);

  const busy = agent.status === "submitted" || agent.status === "streaming";
  const atLimit = count >= MESSAGE_LIMIT;
  const messages = agent.data.messages as unknown as Message[];
  const lastRole = messages.at(-1)?.role;

  const send = async () => {
    const text = input.trim();
    if (text.length === 0 || busy || atLimit) return;
    setInput("");
    setCount(bumpCount());
    try {
      await agent.send(text);
    } catch {
      // surfaced via agent.error
    }
  };

  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <div style={styles.title}>Mem0 Agent</div>
        <div style={styles.subtitle}>
          Long-term memory demo — watch it <b style={styles.hl}>save</b> and <b style={styles.hl}>recall</b> facts as you chat.
        </div>
      </header>

      <div style={styles.thread}>
        {messages.length === 0 ? (
          <div style={styles.empty}>
            Try: &ldquo;I&rsquo;m vegetarian and allergic to peanuts.&rdquo;
            <br />
            Then ask: &ldquo;What can I cook for dinner?&rdquo;
            <br />
            <span style={styles.emptyHint}>You&rsquo;ll see 💾 and 🔎 whenever it touches memory.</span>
          </div>
        ) : null}

        {messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <div
              key={message.id}
              style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: isUser ? "flex-end" : "flex-start" }}
            >
              {message.parts.map((part, index) => {
                if (part.type === "text" && part.text) {
                  return (
                    <div
                      key={index}
                      style={{
                        ...styles.bubble,
                        background: isUser ? "#27272a" : "transparent",
                        padding: isUser ? "9px 13px" : "0",
                      }}
                    >
                      {part.text}
                    </div>
                  );
                }
                const tool = toolInfo(part);
                if (tool) {
                  return (
                    <div key={index} style={styles.memEvent}>
                      {memoryLine(tool.name, tool.input, tool.output)}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          );
        })}

        {busy && lastRole === "user" ? <div style={styles.thinking}>…</div> : null}
        {agent.error ? <div style={styles.error}>Error: {agent.error.message}</div> : null}
      </div>

      <div style={styles.composerWrap}>
        {atLimit ? (
          <div style={styles.limit}>
            You&rsquo;ve reached the demo message limit. Deploy your own from the repo to keep going.
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
            style={styles.form}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Send a message…"
              disabled={busy}
              style={styles.input}
            />
            <button type="submit" disabled={busy || input.trim().length === 0} style={styles.button}>
              {busy ? "…" : "Send"}
            </button>
          </form>
        )}
        <div style={styles.footer}>
          {Math.max(0, MESSAGE_LIMIT - count)} messages left · powered by Mem0 + eve
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  main: { maxWidth: 720, margin: "0 auto", height: "100dvh", display: "flex", flexDirection: "column", padding: "0 16px" },
  header: { padding: "22px 0 16px", textAlign: "center", borderBottom: "1px solid #1f1f23" },
  title: { fontSize: 18, fontWeight: 600 },
  subtitle: { color: "#a1a1aa", fontSize: 13, marginTop: 4 },
  hl: { color: "#c4b5fd", fontWeight: 600 },
  thread: { flex: 1, overflowY: "auto", padding: "18px 0", display: "flex", flexDirection: "column", gap: 12 },
  empty: { color: "#71717a", textAlign: "center", marginTop: 48, lineHeight: 1.7 },
  emptyHint: { color: "#52525b", fontSize: 13 },
  bubble: { maxWidth: "86%", borderRadius: 12, whiteSpace: "pre-wrap", lineHeight: 1.55 },
  memEvent: {
    maxWidth: "86%",
    fontSize: 13,
    color: "#c4b5fd",
    background: "rgba(124, 92, 255, 0.08)",
    border: "1px solid rgba(124, 92, 255, 0.20)",
    borderRadius: 8,
    padding: "6px 10px",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    whiteSpace: "pre-wrap",
    lineHeight: 1.5,
  },
  thinking: { color: "#71717a", alignSelf: "flex-start" },
  error: { color: "#f87171", fontSize: 14 },
  composerWrap: { padding: "12px 0 20px" },
  limit: { color: "#a1a1aa", textAlign: "center", fontSize: 14 },
  form: { display: "flex", gap: 8 },
  input: { flex: 1, background: "#18181b", color: "#fafafa", border: "1px solid #333", borderRadius: 10, padding: "12px 14px", fontSize: 15, outline: "none" },
  button: { background: "#fafafa", color: "#09090b", border: 0, borderRadius: 10, padding: "0 18px", fontWeight: 600, cursor: "pointer" },
  footer: { color: "#52525b", fontSize: 12, textAlign: "center", marginTop: 8 },
};
