import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const { userId } = await verifyToken(token);

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
        customPermissions: true,
      },
    });

    if (!user) {
      return null;
    }

    const permissions = [
      ...user.role.permissions.map(
        (item) => item.permission
      ),
      ...user.customPermissions.map(
        (item) => item.permission
      ),
    ];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      permissions,
    };
  } catch {
    return null;
  }
}