import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

// Tools answer with compact JSON; agents read it fine and it keeps responses small.
export const jsonResult = (data: unknown): CallToolResult => ({
  content: [{ type: "text", text: JSON.stringify(data) }],
});

// An error the agent can read and react to (bad id, nothing found), rather than a protocol failure.
export const errorResult = (message: string): CallToolResult => ({
  content: [{ type: "text", text: message }],
  isError: true,
});
