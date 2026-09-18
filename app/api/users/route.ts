import { Permission } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { hasPermission } from "@/lib/permissions";
import { hashPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    // 1. Current logged-in user
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
        Permission.PROVISION_USERS
      )
    ) {
      return Response.json(
        {
          success: false,
          message: "You do not have permission to create users",
        },
        { status: 403 }
      );
    }

    // 3. Request body
    const body = await request.json();

    const { name, role } = body;

    if (!name || !role) {
      return Response.json(
        {
          success: false,
          message: "Name and role are required",
        },
        { status: 400 }
      );
    }

    // 4. Find requested role
    const requestedRole = await prisma.role.findUnique({
      where: {
        name: role,
      },
    });

    if (!requestedRole) {
      return Response.json(
        {
          success: false,
          message: "Invalid role",
        },
        { status: 400 }
      );
    }

    // 5. Owner cannot create another Owner
    if (
      currentUser.role === "Owner" &&
      requestedRole.name === "Owner"
    ) {
      return Response.json(
        {
          success: false,
          message: "Owner cannot create another Owner",
        },
        { status: 403 }
      );
    }

    // 6. Allowed roles
    const allowedRoles = [
      "Owner",
      "Manager",
      "Field Employee",
    ];

    if (!allowedRoles.includes(requestedRole.name)) {
      return Response.json(
        {
          success: false,
          message: "This role cannot be created",
        },
        { status: 400 }
      );
    }

    // 7. Generate random email
    const randomString = crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 8);

    const generatedEmail =
      `${name.toLowerCase().replace(/\s+/g, "")}.${randomString}@fieldops.test`;

    // 8. Generate random password
    const temporaryPassword = crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 14);

    // 9. Hash password
    const hashedPassword = await hashPassword(
      temporaryPassword
    );

    // 10. Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: generatedEmail,
        password: hashedPassword,
        roleId: requestedRole.id,
      },
    });

    // 11. Return generated credentials
    return Response.json(
      {
        success: true,
        message: "User created successfully",

        credentials: {
          email: generatedEmail,
          password: temporaryPassword,
        },

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: requestedRole.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}

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

    // 3. Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,

        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    // 4. Return users
    return Response.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}