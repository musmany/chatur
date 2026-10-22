"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  type: "chat" | "system";
  senderId?: string;
  senderName?: string;
  text: string;
};

/* ---------- Visual-only helpers (no effect on chat behaviour) ---------- */

const AVATAR_COLORS = [
  "bg-rose-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-pink-500",
];

const avatarColor = (seed = "") => {
  let sum = 0;
  for (const ch of seed) sum += ch.charCodeAt(0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

export default function Home() {
  const socketRef = useRef<WebSocket | null>(null);

  const [status, setStatus] = useState("Connecting...");
  const [clientId, setClientId] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // useEffect(() => {
  //   console.log("Creating WebSocket connection...");
  //   const socket = new WebSocket("ws://localhost:8080");
  //   socketRef.current = socket;
  //   socket.onopen = () => {
  //     console.log("WebSocket OPEN");
  //     setStatus("Connected");
  //   };
  //   socket.onmessage = (event) => {
  //     console.log("Message received:", event.data);
  //     const data = JSON.parse(event.data);
  //     if (data.type === "welcome") {
  //       setClientId(data.id);
  //       setName(data.name);
  //       return;
  //     }
  //     if (data.type === "chat") {
  //       setMessages((previous) => [
  //         ...previous,
  //         data,
  //       ]);
  //       return;
  //     }
  //     if (data.type === "system") {
  //       setMessages((previous) => [
  //         ...previous,
  //         data,
  //       ]);
  //       return;
  //     }
  //   };
  //   socket.onerror = (error) => {
  //     console.error("WebSocket ERROR:", error);
  //     setStatus("Error");
  //   };
  //   socket.onclose = () => {
  //     console.log("WebSocket CLOSED");
  //     setStatus("Disconnected");
  //   };
  //   return () => {
  //     console.log("React cleanup: closing WebSocket");
  //     socket.close();
  //     socketRef.current = null;
  //   };
  // }, []);
useEffect(() => {
  let cancelled = false;
  let socket: WebSocket | null = null;

  async function connect() {
    try {
      console.log("Loading WebSocket configuration...");

      const response = await fetch("/api/config", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Could not load WebSocket configuration");
      }

      const config: { wsUrl: string } = await response.json();

      if (cancelled) return;

      console.log("Creating WebSocket connection...");

      socket = new WebSocket(config.wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket OPEN");
        setStatus("Connected");
      };

      socket.onmessage = (event) => {
        console.log("Message received:", event.data);

        try {
          const data = JSON.parse(event.data);

          if (data.type === "welcome") {
            setClientId(data.id);
            setName(data.name);
            return;
          }

          if (data.type === "chat" || data.type === "system") {
            setMessages((previous) => [...previous, data]);
          }
        } catch (error) {
          console.error("Could not parse server message:", error);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket ERROR:", error);
        setStatus("Error");
      };

      socket.onclose = () => {
        console.log("WebSocket CLOSED");
        setStatus("Disconnected");
      };
    } catch (error) {
      if (!cancelled) {
        console.error("Connection setup failed:", error);
        setStatus("Error");
      }
    }
  }

  void connect();

  return () => {
    cancelled = true;

    console.log("React cleanup: closing WebSocket");

    socket?.close();

    if (socketRef.current === socket) {
      socketRef.current = null;
    }
  };
}, []);

  const sendMessage = () => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    if (!message.trim()) {
      return;
    }

    socket.send(
      JSON.stringify({
        type: "chat",
        text: message,
      })
    );

    setMessage("");
  };

  const changeName = () => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    if (!name.trim()) {
      return;
    }

    socket.send(
      JSON.stringify({
        type: "set-name",
        name: name.trim(),
      })
    );
  };

  /* Visual-only: colour of the connection indicator */
  const statusStyle =
    status === "Connected"
      ? { dot: "bg-emerald-400", text: "text-emerald-300" }
      : status === "Connecting..."
      ? { dot: "bg-amber-400 animate-pulse", text: "text-amber-300" }
      : { dot: "bg-rose-400", text: "text-rose-300" };

  return (
    <main className="flex h-dvh items-center justify-center bg-slate-200 sm:p-6">
      <div className="flex h-full w-full max-w-3xl flex-col overflow-hidden bg-white sm:max-h-[860px] sm:rounded-2xl sm:shadow-2xl sm:ring-1 sm:ring-slate-300">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 bg-slate-900 px-5 py-4 text-white">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-white"
                aria-hidden="true"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold leading-tight">
                WebSocket Chat
              </h1>
              <p className="truncate text-xs text-slate-400">
                Your ID:{" "}
                <strong className="font-semibold text-slate-200">
                  {clientId}
                </strong>
              </p>
            </div>
          </div>

          <h2
            className={`flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium ring-1 ring-white/15 ${statusStyle.text}`}
          >
            <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
            <span>
              <span className="hidden sm:inline">Status: </span>
              {status}
            </span>
          </h2>
        </header>

        {/* Display name */}
        <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3">
          <label
            htmlFor="display-name"
            className="hidden shrink-0 text-sm font-medium text-slate-600 sm:block"
          >
            Display name
          </label>

          <input
            id="display-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />

          <button
            onClick={changeName}
            className="shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 active:bg-slate-200"
          >
            Set Name
          </button>
        </div>

        {/* Messages (column-reverse keeps the view pinned to the newest message) */}
        <section
          aria-label="Messages"
          className="flex flex-1 flex-col-reverse overflow-y-auto bg-slate-50 px-4 py-5 sm:px-6"
        >
          <div className="flex shrink-0 flex-col gap-4">
            {messages.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-400">
                No messages yet. Say hello below.
              </p>
            )}

            {messages.map((msg, index) => {
              if (msg.type === "system") {
                return (
                  <div key={index} className="flex justify-center">
                    <span className="rounded-full bg-slate-200/80 px-3 py-1 text-xs text-slate-600">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              const isOwn = msg.senderId === clientId;

              return (
                <div
                  key={index}
                  className={`flex items-end gap-2.5 ${
                    isOwn ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${avatarColor(
                      msg.senderId
                    )}`}
                  >
                    {(msg.senderName || "?").charAt(0).toUpperCase()}
                  </div>

                  <div
                    className={`flex min-w-0 max-w-[78%] flex-col ${
                      isOwn ? "items-end" : "items-start"
                    }`}
                  >
                    <span className="mb-1 px-1 text-xs text-slate-500">
                      <strong className="font-semibold text-slate-700">
                        {msg.senderName}
                      </strong>{" "}
                      ({msg.senderId})
                    </span>

                    <div
                      className={`min-w-0 break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isOwn
                          ? "rounded-br-sm bg-teal-600 text-white shadow-sm"
                          : "rounded-bl-sm bg-white text-slate-800 shadow-sm ring-1 ring-slate-200"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Composer */}
        <div className="flex items-center gap-3 border-t border-slate-200 bg-white px-4 py-4 sm:px-5">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />

          <button
            onClick={sendMessage}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 active:bg-teal-800"
          >
            Send
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22l-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}