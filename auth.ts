import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./lib/prisma";
import { userRoles } from "@/configs/staticRecords/userRoles";


const isDemo = process.env.DEMO_SEED === "true";

const demoCredentials = Credentials({
  name: "Demo",
  credentials: {
    username: { label: "Username", type: "text", value: "demo" },
    password: { label: "Password", type: "password", value: "demo" },
  },
  authorize: async (credentials) => {
    if (credentials?.username !== "demo" || credentials?.password !== "demo") {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: "demo@demo.lumexia" },
      select: { id: true, email: true, name: true },
    });

    return user ?? null;
  },
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: isDemo ? [Discord, demoCredentials] : [Discord],
  ...(isDemo ? { session: { strategy: "jwt" as const } } : {}),
  callbacks: {
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
