import { apiHandler, jsonResponse } from "@/lib/api/v1/errors";
import { requireRead } from "@/lib/api/v1/auth";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (req) => {
  const auth = await requireRead(req);
  return jsonResponse({ ok: true, apiVersion: "1", key: { userId: auth.userId, scopes: auth.scopes } });
});
