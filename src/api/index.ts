import axios from "axios";
import type { Message } from "../interface";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

if (!baseUrl) {
  throw new Error("VITE_API_BASE_URL is not defined in your .env file.");
}

const handleSend = async (
  input: string,
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  try {
    const response = await axios.post<{ reply: string; history: Message[] }>(
      `${baseUrl}/mcp/chat`,
      {
        message: input,
        conversationHistory: messages,
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
  }
};

export { handleSend };
