// src/Chat.tsx

import { useState, type FormEvent, useEffect, useRef } from "react";
import axios from "axios";
import { marked } from "marked";

// Define the structure of a single message part for type safety
interface MessagePart {
  text?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  functionCall?: any; // You can define this more strictly if needed
}

// Define the structure of a full message in the conversation history
interface Message {
  role: "user" | "model" | "tool";
  parts: MessagePart[];
}

export function Chat() {
  // State to hold the entire conversation history
  const [messages, setMessages] = useState<Message[]>([]);
  // State for the user's current input
  const [input, setInput] = useState("");
  // State to show a loading indicator while the AI is thinking
  const [isLoading, setIsLoading] = useState(false);
  // Ref to the chat container to auto-scroll to the bottom
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Effect to scroll to the latest message whenever the messages array changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Immediately add the user's message to the UI for a responsive feel
    const userMessage: Message = { role: "user", parts: [{ text: input }] };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Send the user's message AND the current conversation history to the brain
      const response = await axios.post<{ reply: string; history: Message[] }>(
        "http://136.144.28.76/chatbot-api/chat",
        {
          message: input,
          conversationHistory: messages, // <-- Send the OLD history
        }
      );

      // Update the entire conversation with the full history from the backend
      setMessages(response.data.history);
    } catch (error) {
      console.error("Error communicating with the AI agent:", error);
      // Add an error message to the chat for the user
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
          // We only want to display messages that have simple text content
          const messageText = msg.parts[0]?.text;
          if (!messageText) return null; // Don't render tool calls or empty messages

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
