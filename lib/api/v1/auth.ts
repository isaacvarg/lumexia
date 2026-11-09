import { apiKeyScopes, authenticateApiKey, type ApiKeyAuth } from "@/lib/apiKeys";
import { ApiError } from "./errors";

export type V1Auth = { userId: string; scopes: string[] };

// Authenticates "Authorization: Bearer lmx_..." with the same per-user keys the MCP endpoint uses.
// Unknown, revoked, expired or disabled-user keys are 401; a valid key without the read scope is 403.
export const requireRead = async (
  req: Request,
  authenticate: (authorization: string | null) => Promise<ApiKeyAuth | null> = authenticateApiKey,
): Promise<V1Auth> => {
  const auth = await authenticate(req.headers.get("authorization"));
  if (!auth) {
    throw new ApiError("unauthorized", "Missing or invalid API key. Send Authorization: Bearer lmx_...");
  }
  if (!auth.scopes.includes(apiKeyScopes.read)) {
    throw new ApiError("forbidden", "This API key does not have read access");
  }
  return { userId: auth.user.id, scopes: auth.scopes };
};
