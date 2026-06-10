import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./lib/prisma";
import { userRoles } from "@/configs/staticRecords/userRoles";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Discord],
  callbacks: {
    // Block disabled users from signing in. Existing users have a DB row with an
    // id; brand-new users (first signup) won't, so allow those through.
    async signIn({ user }) {
      if (!user.id) return true;

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { disabled: true },
      });

      return !dbUser?.disabled;
    },
  },
  events: {
    // Bootstrap an administrator: the first user to ever sign up (when no
    // systemAdmin exists yet) is granted the systemAdmin role so there is
    // always someone who can administer roles.
    async createUser({ user }) {
      if (!user.id) return;

      const adminExists = await prisma.userRoleAssignment.count({
        where: { userRoleId: userRoles.systemAdmin },
      });

      if (adminExists === 0) {
        await prisma.userRoleAssignment.create({
          data: { userId: user.id, userRoleId: userRoles.systemAdmin },
        });
      }
    },
  },
});
