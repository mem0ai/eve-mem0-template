"use client";

import { useEveAgent } from "eve/react";
import { type CSSProperties, useState } from "react";

type Part = { readonly type: string; readonly text?: string };
type Message = { readonly id: string; readonly role: string; readonly parts: readonly Part[] };

function textOf(message: Message): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("");
}

export default function Page() {
  const agent = useEveAgent();
  const [input, setInput] = useState("");

  const busy = agent.status === "submitted" || agent.status === "streaming";
  const messages = agent.data.messages as unknown as Message[];

  const send = async () => {
    const text = input.trim();
    if (text.length === 0 || busy) return;
    setInput("");
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
        <div style={styles.subtitle}>Long-term memory, built with eve. Tell it something, then ask it later.</div>
      </header>

      <div style={styles.thread}>
        {messages.length === 0 ? (
          <div style={styles.empty}>
            Try: &ldquo;I&rsquo;m vegetarian and allergic to peanuts.&rdquo;
            <br />
            Then ask: &ldquo;What can I cook for dinner?&rdquo;
          </div>
        ) : null}

        {messages.map((message) => {
          const isUser = message.role === "user";
          const body = textOf(message);
          return (
            <div
              key={message.id}
              style={{
                ...styles.bubble,
                alignSelf: isUser ? "flex-end" : "flex-start",
                background: isUser ? "#27272a" : "transparent",
                padding: isUser ? "9px 13px" : "0",
              }}
            >
              {body || (message.role === "assistant" && busy ? "…" : "")}
            </div>
          );
        })}

        {agent.error ? <div style={styles.error}>Error: {agent.error.message}</div> : null}
      </div>

      <div style={styles.composerWrap}>
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
        <div style={styles.footer}>powered by Mem0 + eve</div>
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  main: { maxWidth: 720, margin: "0 auto", height: "100dvh", display: "flex", flexDirection: "column", padding: "0 16px" },
  header: { padding: "22px 0 16px", textAlign: "center", borderBottom: "1px solid #1f1f23" },
  title: { fontSize: 18, fontWeight: 600 },
  subtitle: { color: "#a1a1aa", fontSize: 13, marginTop: 4 },
  thread: { flex: 1, overflowY: "auto", padding: "18px 0", display: "flex", flexDirection: "column", gap: 12 },
  empty: { color: "#71717a", textAlign: "center", marginTop: 48, lineHeight: 1.7 },
  bubble: { maxWidth: "86%", borderRadius: 12, whiteSpace: "pre-wrap", lineHeight: 1.55 },
  error: { color: "#f87171", fontSize: 14 },
  composerWrap: { padding: "12px 0 20px" },
  form: { display: "flex", gap: 8 },
  input: { flex: 1, background: "#18181b", color: "#fafafa", border: "1px solid #333", borderRadius: 10, padding: "12px 14px", fontSize: 15, outline: "none" },
  button: { background: "#fafafa", color: "#09090b", border: 0, borderRadius: 10, padding: "0 18px", fontWeight: 600, cursor: "pointer" },
  footer: { color: "#52525b", fontSize: 12, textAlign: "center", marginTop: 8 },
};
