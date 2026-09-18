import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return Response.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

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
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const permissions = [
      ...user.role.permissions.map(
        (item) => item.permission
      ),
      ...user.customPermissions.map(
        (item) => item.permission
      ),
    ];

    return Response.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        permissions,
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);

    return Response.json(
      {
        success: false,
        message: "Invalid or expired session",
      },
      { status: 401 }
    );
  }
}