import { apiHandler, jsonResponse } from "@/lib/api/v1/errors";
import { requireRead } from "@/lib/api/v1/auth";
import { parseBoolean, parseCursor, parseLimit, parseMulti, parseSingle, parseTimestamp } from "@/lib/api/v1/params";
import { listItems } from "@/lib/api/v1/queries";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (req) => {
  await requireRead(req);
  const sp = new URL(req.url).searchParams;
  const result = await listItems(
    {
      q: parseSingle(sp, "q"),
      referenceCodes: parseMulti(sp, "reference_code"),
      ids: parseMulti(sp, "id"),
      updatedSince: parseTimestamp(sp, "updated_since"),
      includeArchived: parseBoolean(sp, "include_archived", true),
    },
    parseCursor(sp),
    parseLimit(sp),
  );
  return jsonResponse({ items: result.items, nextCursor: result.nextCursor });
});
