import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  const start = performance.now();

  try {
    const cookieStart = performance.now();

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    console.log(
      "[/api/auth/me] cookies:",
      Math.round(performance.now() - cookieStart),
      "ms"
    );

    if (!token) {
      return Response.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const jwtStart = performance.now();

    const { userId } = await verifyToken(token);

    console.log(
      "[/api/auth/me] jwt:",
      Math.round(performance.now() - jwtStart),
      "ms"
    );

    const dbStart = performance.now();

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

    console.log(
      "[/api/auth/me] database:",
      Math.round(performance.now() - dbStart),
      "ms"
    );

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
      ...user.role.permissions.map((item) => item.permission),
      ...user.customPermissions.map((item) => item.permission),
    ];

    console.log(
      "[/api/auth/me] total:",
      Math.round(performance.now() - start),
      "ms"
    );

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

    console.log(
      "[/api/auth/me] failed after:",
      Math.round(performance.now() - start),
      "ms"
    );

    return Response.json(
      {
        success: false,
        message: "Invalid or expired session",
      },
      { status: 401 }
    );
  }
}