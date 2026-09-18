import { Permission } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { hasPermission } from "@/lib/permissions";

// ==========================================
// GET /api/roles
// ==========================================
export async function GET() {
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

    // 2. Permission check
    if (
      !hasPermission(
        currentUser.permissions,
        Permission.MANAGE_ROLES
      )
    ) {
      return Response.json(
        {
          success: false,
          message: "You do not have permission to manage roles",
        },
        { status: 403 }
      );
    }

    // 3. Fetch roles
    let roles;

    if (currentUser.role === "Owner") {
      // Owner can manage only lower-level business roles
      roles = await prisma.role.findMany({
        where: {
          name: {
            in: ["Manager", "Field Employee"],
          },
        },
        include: {
          permissions: true,
        },
        orderBy: {
          name: "asc",
        },
      });
    } else {
      // Super Admin can see all roles
      roles = await prisma.role.findMany({
        include: {
          permissions: true,
        },
        orderBy: {
          name: "asc",
        },
      });
    }

    return Response.json({
      success: true,
      count: roles.length,
      roles,
    });
  } catch (error) {
    console.error("Get roles error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}

// ==========================================
// PUT /api/roles
// Update role permissions
// ==========================================
export async function PUT(request: Request) {
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

    // 2. Permission check
    if (
      !hasPermission(
        currentUser.permissions,
        Permission.MANAGE_ROLES
      )
    ) {
      return Response.json(
        {
          success: false,
          message: "You do not have permission to manage roles",
        },
        { status: 403 }
      );
    }

    // 3. Read request body
    const body = await request.json();

    const { roleId, permissions } = body;

    if (!roleId || !Array.isArray(permissions)) {
      return Response.json(
        {
          success: false,
          message: "roleId and permissions array are required",
        },
        { status: 400 }
      );
    }

    // 4. Find requested role
    const role = await prisma.role.findUnique({
      where: {
        id: roleId,
      },
    });

    if (!role) {
      return Response.json(
        {
          success: false,
          message: "Role not found",
        },
        { status: 404 }
      );
    }

    // ==========================================
    // Owner restrictions
    // ==========================================

    if (
      currentUser.role === "Owner" &&
      (role.name === "Super Admin" ||
        role.name === "Owner")
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Owner cannot manage Super Admin or Owner permissions",
        },
        { status: 403 }
      );
    }

    // ==========================================
    // Super Admin restriction
    // ==========================================

    // Super Admin can manage every role.

    // 5. Validate permissions
    const allPermissions = Object.values(Permission);

    const invalidPermissions = permissions.filter(
      (permission: string) =>
        !allPermissions.includes(permission as Permission)
    );

    if (invalidPermissions.length > 0) {
      return Response.json(
        {
          success: false,
          message: "Invalid permission provided",
          invalidPermissions,
        },
        { status: 400 }
      );
    }

    // 6. Remove duplicates
    const uniquePermissions = [
      ...new Set(permissions as Permission[]),
    ];

    // 7. Replace permissions
    await prisma.$transaction([
      prisma.rolePermission.deleteMany({
        where: {
          roleId,
        },
      }),

      prisma.rolePermission.createMany({
        data: uniquePermissions.map((permission) => ({
          roleId,
          permission,
        })),
      }),
    ]);

    // 8. Get updated role
    const updatedRole = await prisma.role.findUnique({
      where: {
        id: roleId,
      },
      include: {
        permissions: true,
      },
    });

    return Response.json({
      success: true,
      message: "Role permissions updated successfully",
      role: updatedRole,
    });
  } catch (error) {
    console.error(
      "Update role permissions error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}