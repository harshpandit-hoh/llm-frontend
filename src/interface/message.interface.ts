import { type MessagePart } from "./messagepart.interface";

interface Message {
  role: "user" | "model" | "tool";
  parts: MessagePart[];
}

export type { Message };
