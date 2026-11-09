import { ApiError, apiHandler, jsonResponse } from "@/lib/api/v1/errors";
import { requireRead } from "@/lib/api/v1/auth";
import { getLot } from "@/lib/api/v1/queries";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (req, { params }: { params: { id: string } }) => {
  await requireRead(req);
  const lot = await getLot(params.id);
  if (!lot) throw new ApiError("not_found", "Lot not found");
  return jsonResponse(lot);
});
