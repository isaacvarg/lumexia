import { ApiError, apiHandler, jsonResponse } from "@/lib/api/v1/errors";
import { requireRead } from "@/lib/api/v1/auth";
import { getItem } from "@/lib/api/v1/queries";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (req, { params }: { params: { id: string } }) => {
  await requireRead(req);
  const item = await getItem(params.id);
  if (!item) throw new ApiError("not_found", "Item not found");
  return jsonResponse(item);
});
