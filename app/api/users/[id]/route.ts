import { Permission } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { hasPermission } from "@/lib/permissions";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    // 1. Get logged-in user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return Response.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    // 2. Check permission
    if (
      !hasPermission(
        currentUser.permissions,
        Permission.MANAGE_USER_ACCOUNTS
      )
    ) {
      return Response.json(
        {
          success: false,
          message:
            "You do not have permission to manage user accounts",
        },
        { status: 403 }
      );
    }

    // 3. Get user ID from URL
    const { id } = await context.params;

    if (!id) {
      return Response.json(
        {
          success: false,
          message: "User ID is required",
        },
        { status: 400 }
      );
    }

    // 4. Prevent deleting yourself
    if (id === currentUser.id) {
      return Response.json(
        {
          success: false,
          message: "You cannot delete your own account",
        },
        { status: 400 }
      );
    }

    // 5. Check user exists
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            name: true,
          },
        },
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

    // 6. Delete user
    await prisma.user.delete({
      where: {
        id,
      },
    });

    // 7. Return success
    return Response.json({
      success: true,
      message: "User deleted successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}