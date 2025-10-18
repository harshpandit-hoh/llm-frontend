import { useState, type FormEvent, useEffect, useRef } from "react";
import axios from "axios";
import { marked } from "marked";
import type { Message } from "./interface";

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", parts: [{ text: input }] };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post<{ reply: string; history: Message[] }>(
        "http://136.144.28.76/chatbot-api/chat", //? Production server
        // "http://localhost:3002/api/chat", //? local server
        {
          message: input,
          conversationHistory: messages, // <-- Send the OLD history
        }
      );

      setMessages(response.data.history);
    } catch (error) {
      console.error("Error communicating with the AI agent:", error);
      const errorMessage: Message = {
        role: "model",
        parts: [
          {
            text: "Sorry, I'm having trouble connecting to my brain right now.",
          },
        ],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-window">
        {messages.map((msg, index) => {
          const messageText = msg.parts[0]?.text;
          if (!messageText) return null;

          return (
            <div key={index} className={`chat-bubble ${msg.role}`}>
              <div
                dangerouslySetInnerHTML={{ __html: marked.parse(messageText) }}
              />
            </div>
          );
        })}
        {isLoading && (
          <div className="chat-bubble model">
            <div className="loading-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form className="chat-input-form" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the IFM Dashboard..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}
