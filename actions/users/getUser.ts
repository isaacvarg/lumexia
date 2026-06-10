"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { userRoles } from "@/configs/staticRecords/userRoles";
import { getFileUrl } from "@/actions/files/getUrl";

export const getUser = async () => {
  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    redirect('/api/auth/signin')
  }

  const user = await prisma.user.findFirstOrThrow({
    where: {
      email: session.user.email,
    },
    include: {
      UserRoleAssignment: {
        include: {
          userRole: true,
        }
      }
    },
  });

  // some transformations for easier use

  // Uploaded avatars are stored as bare RustFS object keys (no scheme), whereas
  // Discord avatars are absolute URLs. Resolve object keys to a fresh presigned
  // URL so every consumer can treat user.image as a ready-to-use URL.
  let image = user.image
  if (image && !image.startsWith('http')) {
    image = await getFileUrl(process.env.S3_BUCKET_NAME!, image)
  }

  const isPurchasing = user &&
    user.UserRoleAssignment.length > 0 &&
    user.UserRoleAssignment.some(r => r.userRoleId === userRoles.purchasing)

  const isProduction = user && user.UserRoleAssignment.length > 0 &&
    user.UserRoleAssignment.some(r => r.userRoleId === userRoles.production)

  const isProductionQuality = user && user.UserRoleAssignment.length > 0 &&
    user.UserRoleAssignment.some(r => r.userRoleId === userRoles.productionQuality)

  const isProductionQualitySecondary = user && user.UserRoleAssignment.length > 0 &&
    user.UserRoleAssignment.some(r => r.userRoleId === userRoles.productionQualitySecondary)



  return {
    ...user,
    image,
    roles: {
      isPurchasing,
      isProduction,
      isProductionQuality,
      isProductionQualitySecondary,
    }
  };
};

export type User = Awaited<ReturnType<typeof getUser>>
