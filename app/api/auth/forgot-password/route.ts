import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Email is required.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    /*
     * Do not reveal whether an account exists.
     */
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists for this email, a password reset link has been sent.",
      });
    }

    /*
     * Accounts where password change is disabled
     * cannot use forgot password.
     *
     * Owner accounts are configured this way.
     */
    if (!user.passwordChangeAllowed) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists for this email, a password reset link has been sent.",
      });
    }

    /*
     * Generate secure reset token.
     */
    const token = crypto
      .randomBytes(32)
      .toString("hex");

    /*
     * Token expires in 15 minutes.
     */
    const expiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    );

    /*
     * Remove previous unused tokens
     * for this user.
     */
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        used: false,
      },
    });

    /*
     * Store new reset token.
     */
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    /*
     * Production URL comes from APP_URL.
     */
    const appUrl =
      process.env.APP_URL ||
      "http://localhost:3000";

    const resetUrl =
      `${appUrl}/reset-password?token=${token}`;

    /*
     * Send reset email.
     */
    try {
      await sendPasswordResetEmail({
        to: user.email,
        name:
          user.name ||
          user.email.split("@")[0],
        resetUrl,
      });
    } catch (emailError) {
      console.error(
        "PASSWORD RESET EMAIL ERROR:",
        emailError
      );

      /*
       * Do not keep a reset token if
       * email delivery failed.
       */
      await prisma.passwordResetToken.delete({
        where: {
          token,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to send password reset email. Please try again later.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Password reset link has been sent to your email.",
    });
  } catch (error) {
    console.error(
      "FORGOT PASSWORD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}