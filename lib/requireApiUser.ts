import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// Session gate for app/api route handlers. Middleware can't do this check:
// it runs on the edge runtime, where the Prisma adapter's database sessions
// can't be read. Each handler calls this first instead.
//
// The disabled flag is re-checked on every request because auth.ts only checks
// it at sign-in, so a session issued before a user was disabled stays valid
// until it expires.
//
// Usage:
//   const gate = await requireApiUser();
//   if (gate instanceof Response) return gate;
//   gate.userId ...

export type ApiUser = { userId: string };

export const requireApiUser = async (): Promise<ApiUser | Response> => {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, disabled: true },
  });

  // A missing user means a stale session (e.g. after a reseed).
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.disabled) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return { userId: user.id };
};
