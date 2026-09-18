import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return Response.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    console.log("FORGOT PASSWORD EMAIL:", email);

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        role: true,
      },
    });

    // User not found
    if (!user) {
      console.log("USER FOUND: false");

      return Response.json(
        {
          success: false,
          message: "User not found in database",
          email,
        },
        { status: 404 }
      );
    }

    console.log("USER FOUND: true");
    console.log("USER ROLE:", user.role.name);
    console.log(
      "PASSWORD CHANGE ALLOWED:",
      user.passwordChangeAllowed
    );

    // Owner / locked account
    if (!user.passwordChangeAllowed) {
      return Response.json(
        {
          success: false,
          message: "Password reset is not allowed for this account",
          role: user.role.name,
        },
        { status: 403 }
      );
    }

    // Delete old unused tokens
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        used: false,
      },
    });

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");

    // Token expires after 15 minutes
    const expiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    );

    // Save token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Testing reset URL
    const resetUrl =
      `http://localhost:3000/reset-password?token=${token}`;

    console.log("RESET LINK GENERATED");

    return Response.json({
      success: true,
      message: "Password reset link generated successfully",
      email: user.email,
      role: user.role.name,
      resetUrl,
      expiresAt,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}