import React, { useEffect, useRef, useState } from "react";

/**
 * Simple AI Chat App
 */

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  loading?: boolean;
};

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: generateId(),
      role: "ai",
      content: "Hello — I'm your AI assistant. Ask me anything.",
    },
  ]);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [threadId, setThreadId] = useState<number>(1);
  const listRef = useRef<HTMLDivElement | null>(null);
  const apiUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:3001").replace(
    /\/+$/,
    ""
  );

  // Scroll to bottom
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const pushMessage = (m: Message) =>
    setMessages((prev) => [...prev, m]);

  const newChat = () => {
    setThreadId((prev) => prev + 1);
    setMessages([
      {
        id: generateId(),
        role: "ai",
        content: "New chat started — how can I help?",
      },
    ]);
    setInput("");
  };

  const sendMessage = async (prompt?: string) => {
    const text = (prompt ?? input).trim();
    if (!text) return;

    // Add user message
    pushMessage({
      id: generateId(),
      role: "user",
      content: text,
    });
    setInput("");
    setSending(true);

    const placeholder: Message = {
      id: generateId(),
      role: "ai",
      content: "",
      loading: true,
    };
    pushMessage(placeholder);

    try {
      const res = await fetch(`${apiUrl}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, thread_id: threadId }),
      });

      if (!res.ok) throw new Error(await res.text());

      const type = res.headers.get("content-type") || "";
      let aiText = "";

      if (type.includes("application/json")) {
        const json = await res.json();
        aiText =
          typeof json === "string"
            ? json
            : typeof json.content === "string"
            ? json.content
            : JSON.stringify(json);
      } else {
        aiText = await res.text();
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholder.id
            ? { ...m, content: aiText, loading: false }
            : m
        )
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholder.id
            ? {
                ...m,
                // content: `Error: ${(err as Error).message}`,
                content: `Sorry, something went wrong while generating the response.`,
                loading: false,
              }
            : m
        )
      );
    } finally {
      setSending(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sending) sendMessage();
    }
  };

  return (
    <div className="app-root">
      <main className="chat-shell">
        <header className="chat-header">
          <div className="left">
            <button className="new-chat-btn" onClick={newChat}>
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              New Chat
            </button>
          </div>

          <h1>AI Chatbot</h1>

          <div className="right">
            <span>Thread #{threadId}</span>
          </div>
        </header>

        <section className="chat-container">
          <div className="messages" ref={listRef}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`message-row ${m.role} ${
                  m.loading ? "loading" : ""
                }`}
              >
                <div className="bubble">
                  <div className="content">
                    {m.loading ? <LoadingDots /> : <pre>{m.content}</pre>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form
            className="composer"
            onSubmit={(e) => {
              e.preventDefault();
              if (!sending) sendMessage();
            }}
          >
            <textarea
              className="input"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />

            <button
              type="submit"
              className="send-btn"
              disabled={sending || !input.trim()}
            >
              {sending ? (
                <div className="spinner" />
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path
                    d="M22 2L11 13"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M22 2 15 22l-4-9-9-4 20-7z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    fill="none"
                  />
                </svg>
              )}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="loading-dots">
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
    </div>
  );
}
