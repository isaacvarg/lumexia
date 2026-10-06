import type { ToolRegistrar } from "../server";
import { jsonResult } from "../results";

export const registerWhoami: ToolRegistrar = (server, ctx) => {
  server.registerTool(
    "whoami",
    {
      title: "Who am I",
      description: "The Lumexia user this API key acts as, and the key's scopes.",
      annotations: { readOnlyHint: true },
    },
    async () => jsonResult({ user: ctx.user, scopes: ctx.scopes }),
  );
};
