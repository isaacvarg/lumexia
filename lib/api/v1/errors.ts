// Error envelope and handler wrapper for the versioned REST API (/api/v1).
// Shape: { "error": { "code": "<snake_case>", "message": "<English, for logs>" } }

export type ApiErrorCode = "invalid_request" | "unauthorized" | "forbidden" | "not_found" | "rate_limited" | "internal";

const statusByCode: Record<ApiErrorCode, number> = {
  invalid_request: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  rate_limited: 429,
  internal: 500,
};

export class ApiError extends Error {
  readonly status: number;
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    readonly headers: Record<string, string> = {},
  ) {
    super(message);
    this.status = statusByCode[code];
  }
}

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };

export const jsonResponse = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...headers } });

export const errorResponse = (error: ApiError) =>
  jsonResponse({ error: { code: error.code, message: error.message } }, error.status, error.headers);

// Wraps a route handler: ApiErrors become their envelope, anything else a 500 (logged, never leaked).
export const apiHandler =
  <Ctx>(handler: (req: Request, ctx: Ctx) => Promise<Response>) =>
  async (req: Request, ctx: Ctx): Promise<Response> => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      if (error instanceof ApiError) return errorResponse(error);
      console.error("[api/v1] unhandled error", error);
      return errorResponse(new ApiError("internal", "Internal server error"));
    }
  };
