import { apiHandler, jsonResponse } from "@/lib/api/v1/errors";
import { requireRead } from "@/lib/api/v1/auth";
import { parseCursor, parseLimit } from "@/lib/api/v1/params";
import { listTypes } from "@/lib/api/v1/queries";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (req) => {
  await requireRead(req);
  const sp = new URL(req.url).searchParams;
  return jsonResponse(await listTypes("itemTypes", parseCursor(sp), parseLimit(sp)));
});
