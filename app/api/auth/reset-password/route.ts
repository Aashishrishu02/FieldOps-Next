import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    // 1. Read request body
    const body = await request.json();

    const { token, newPassword } = body;

    // 2. Validate input
    if (!token || !newPassword) {
      return Response.json(
        {
          success: false,
          message: "Token and new password are required",
        },
        { status: 400 }
      );
    }

    // 3. Basic password validation
    if (newPassword.length < 8) {
      return Response.json(
        {
          success: false,
          message:
            "New password must be at least 8 characters",
        },
        { status: 400 }
      );
    }

    // 4. Find reset token
    const resetToken =
      await prisma.passwordResetToken.findUnique({
        where: {
          token,
        },
        include: {
          user: true,
        },
      });

    // 5. Token not found
    if (!resetToken) {
      return Response.json(
        {
          success: false,
          message: "Invalid reset token",
        },
        { status: 400 }
      );
    }

    // 6. Token already used
    if (resetToken.used) {
      return Response.json(
        {
          success: false,
          message: "Reset token has already been used",
        },
        { status: 400 }
      );
    }

    // 7. Token expired
    if (resetToken.expiresAt < new Date()) {
      return Response.json(
        {
          success: false,
          message: "Reset token has expired",
        },
        { status: 400 }
      );
    }

    // 8. Check whether password change is allowed
    if (!resetToken.user.passwordChangeAllowed) {
      return Response.json(
        {
          success: false,
          message:
            "Password reset is not allowed for this account",
        },
        { status: 403 }
      );
    }

    // 9. Hash new password
    const hashedPassword = await hashPassword(
      newPassword
    );

    // 10. Update password and consume token
    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          password: hashedPassword,
          mustChangePassword: false,
        },
      }),

      prisma.passwordResetToken.update({
        where: {
          id: resetToken.id,
        },
        data: {
          used: true,
        },
      }),
    ]);

    return Response.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}