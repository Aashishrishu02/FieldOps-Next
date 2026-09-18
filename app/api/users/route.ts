import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { hashPassword } from "@/lib/password";
import { sendUserCredentialsEmail } from "@/lib/email";

type CreateUserMode = "email" | "manual";

function generateTemporaryPassword(length = 14) {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%";

  let password = "";

  while (password.length < length) {
    const index = crypto.randomInt(0, characters.length);
    password += characters[index];
  }

  return password;
}

function generateLoginEmail(roleName: string) {
  const rolePrefix = roleName
    .toLowerCase()
    .replace(/\s+/g, "_");

  const randomPart = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `${rolePrefix}_${randomPart}@fieldops.local`;
}

/*
 * GET /api/users
 *
 * Only Super Admin can see the complete user list.
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (
      !currentUser.permissions.includes(
        "MANAGE_USER_ACCOUNTS"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You do not have permission to view users.",
        },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        role: true,
      },
    });

    const safeUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      mustChangePassword: user.mustChangePassword,
      passwordChangeAllowed:
        user.passwordChangeAllowed,
      createdAt: user.createdAt,
    }));

    return NextResponse.json({
      success: true,
      users: safeUsers,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users.",
      },
      { status: 500 }
    );
  }
}

/*
 * POST /api/users
 *
 * Email mode:
 *   Real email + role
 *   -> temporary password generated
 *   -> credentials sent through SMTP
 *
 * Manual mode:
 *   Super Admin selects role
 *   -> login ID generated
 *   -> temporary password generated
 *   -> credentials returned on screen
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const canProvision =
      currentUser.permissions.includes(
        "PROVISION_USERS"
      ) ||
      currentUser.permissions.includes(
        "MANAGE_USER_ACCOUNTS"
      );

    if (!canProvision) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You do not have permission to create users.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const mode: CreateUserMode =
      body.mode === "manual" ? "manual" : "email";

    const requestedEmail = String(
      body.email || ""
    )
      .trim()
      .toLowerCase();

    const roleName = String(
      body.role || ""
    ).trim();

    if (!roleName) {
      return NextResponse.json(
        {
          success: false,
          error: "Role is required.",
        },
        { status: 400 }
      );
    }

    const isSuperAdmin =
      currentUser.permissions.includes(
        "MANAGE_USER_ACCOUNTS"
      );

    /*
     * Super Admin:
     * Owner / Manager / Field Employee
     *
     * Owner:
     * Manager / Field Employee
     */
    const allowedRoles = isSuperAdmin
      ? ["Owner", "Manager", "Field Employee"]
      : ["Manager", "Field Employee"];

    if (!allowedRoles.includes(roleName)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid role selected.",
        },
        { status: 400 }
      );
    }

    /*
     * Manual credentials are only available
     * to Super Admin.
     */
    if (mode === "manual" && !isSuperAdmin) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only Super Admin can generate manual credentials.",
        },
        { status: 403 }
      );
    }

    /*
     * Find selected role.
     */
    const role = await prisma.role.findUnique({
      where: {
        name: roleName,
      },
    });

    if (!role) {
      return NextResponse.json(
        {
          success: false,
          error: "Selected role does not exist.",
        },
        { status: 400 }
      );
    }

    /*
     * Determine login email.
     */
    let loginEmail = requestedEmail;

    /*
     * Email mode requires a real email.
     */
    if (mode === "email") {
      if (!loginEmail) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Email is required when using email delivery.",
          },
          { status: 400 }
        );
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(loginEmail)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Please enter a valid email address.",
          },
          { status: 400 }
        );
      }
    }

    /*
     * Manual mode generates a login ID.
     */
    if (mode === "manual") {
      loginEmail = generateLoginEmail(roleName);
    }

    /*
     * Prevent duplicate account.
     */
    const existingUser = await prisma.user.findUnique({
      where: {
        email: loginEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A user with this email/login ID already exists.",
        },
        { status: 409 }
      );
    }

    /*
     * Generate temporary password.
     */
    const temporaryPassword =
      generateTemporaryPassword();

    const hashedPassword =
      await hashPassword(temporaryPassword);

    /*
     * Initial name.
     */
    const initialName =
      mode === "manual"
        ? `${roleName} User`
        : loginEmail.split("@")[0];

    /*
     * Create user.
     */
    const newUser = await prisma.user.create({
      data: {
        name: initialName,
        email: loginEmail,
        password: hashedPassword,
        roleId: role.id,
        passwordChangeAllowed: true,
        mustChangePassword: true,
      },
      include: {
        role: true,
      },
    });

    /*
     * EMAIL MODE
     */
    if (mode === "email") {
      try {
        await sendUserCredentialsEmail({
          to: loginEmail,
          name: initialName,
          email: loginEmail,
          temporaryPassword,
          role: role.name,
        });
      } catch (emailError) {
        console.error(
          "CREDENTIAL EMAIL ERROR:",
          emailError
        );

        /*
         * Remove the account if email delivery failed.
         */
        await prisma.user.delete({
          where: {
            id: newUser.id,
          },
        });

        return NextResponse.json(
          {
            success: false,
            error:
              "User was not created because the credential email could not be sent. Please check SMTP configuration.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message:
            "User created successfully and credentials were sent by email.",

          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role.name,
          },

          /*
           * Useful during local development.
           * Not returned in production.
           */
          ...(process.env.NODE_ENV !== "production"
            ? {
                credentials: {
                  email: loginEmail,
                  temporaryPassword,
                },
              }
            : {}),
        },
        { status: 201 }
      );
    }

    /*
     * MANUAL MODE
     */
    return NextResponse.json(
      {
        success: true,
        message:
          "Credentials generated successfully.",

        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role.name,
        },

        credentials: {
          email: loginEmail,
          temporaryPassword,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE USER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user.",
      },
      { status: 500 }
    );
  }
}

/*
 * DELETE /api/users
 *
 * Only Super Admin can delete users.
 */
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const isSuperAdmin =
      currentUser.permissions.includes(
        "MANAGE_USER_ACCOUNTS"
      );

    if (!isSuperAdmin) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only Super Admin can delete users.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const userId = String(
      body.userId || ""
    ).trim();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required.",
        },
        { status: 400 }
      );
    }

    /*
     * Super Admin cannot delete himself.
     */
    if (userId === currentUser.id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You cannot delete your own account.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found.",
        },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${user.email} has been deleted successfully.`,
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user.",
      },
      { status: 500 }
    );
  }
}