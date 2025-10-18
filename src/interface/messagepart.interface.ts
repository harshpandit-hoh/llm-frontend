interface MessagePart {
  text?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  functionCall?: any; // You can define this more strictly if needed
}

export type { MessagePart };
