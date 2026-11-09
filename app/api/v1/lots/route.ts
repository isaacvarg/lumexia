import { apiHandler, jsonResponse } from "@/lib/api/v1/errors";
import { requireRead } from "@/lib/api/v1/auth";
import { parseCursor, parseLimit, parseSingle } from "@/lib/api/v1/params";
import { listLots } from "@/lib/api/v1/queries";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (req) => {
  await requireRead(req);
  const sp = new URL(req.url).searchParams;
  return jsonResponse(
    await listLots({ lotNumber: parseSingle(sp, "lot_number"), itemId: parseSingle(sp, "item_id") }, parseCursor(sp), parseLimit(sp)),
  );
});
