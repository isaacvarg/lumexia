import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

// Engine functions accept either the client or an interactive transaction.
export type Db = typeof prisma | Prisma.TransactionClient;
