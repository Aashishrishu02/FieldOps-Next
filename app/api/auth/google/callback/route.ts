import crypto from "crypto";
import { google } from "googleapis";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    // ==========================================
    // 1. Get OAuth parameters
    // ==========================================
    const url = new URL(request.url);

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const oauthError = url.searchParams.get("error");

    // Google login cancelled
    if (oauthError) {
      return NextResponse.redirect(
        new URL(
          "/?error=Google%20login%20cancelled",
          request.url
        )
      );
    }

    // Missing code/state
    if (!code || !state) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Google authentication response",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 2. Verify state cookie
    // ==========================================
    const cookieStore = await cookies();

    const savedState =
      cookieStore.get("google_oauth_state")?.value;

    if (!savedState || savedState !== state) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid OAuth state",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 3. Google OAuth configuration
    // ==========================================
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret =
      process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json(
        {
          success: false,
          message: "Google OAuth configuration is missing",
        },
        { status: 500 }
      );
    }

    // ==========================================
    // 4. Create Google OAuth client
    // ==========================================
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    // ==========================================
    // 5. Exchange authorization code for tokens
    // ==========================================
    const { tokens } =
      await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);

    // ==========================================
    // 6. Get Google user information
    // ==========================================
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data: googleUser } =
      await oauth2.userinfo.get();

    if (!googleUser.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Google account email not available",
        },
        { status: 400 }
      );
    }

    const googleEmail =
      googleUser.email.toLowerCase();

    const googleName =
      googleUser.name ||
      googleEmail.split("@")[0];

    // ==========================================
    // 7. Find existing FieldOps user
    // ==========================================
    let user = await prisma.user.findUnique({
      where: {
        email: googleEmail,
      },
    });

    // ==========================================
    // 8. Create user if not exists
    // ==========================================
    if (!user) {
      const fieldEmployeeRole =
        await prisma.role.findUnique({
          where: {
            name: "Field Employee",
          },
        });

      if (!fieldEmployeeRole) {
        return NextResponse.json(
          {
            success: false,
            message: "Field Employee role not found",
          },
          { status: 500 }
        );
      }

      // Google handles authentication,
      // so FieldOps only needs an internal password.
      const randomPassword =
        crypto.randomUUID() +
        crypto.randomUUID();

      const hashedPassword =
        await hashPassword(randomPassword);

      user = await prisma.user.create({
        data: {
          name: googleName,
          email: googleEmail,
          password: hashedPassword,
          roleId: fieldEmployeeRole.id,
        },
      });
    }

    // ==========================================
    // 9. Create FieldOps JWT
    // ==========================================
    const token = await createToken(user.id);

    // ==========================================
    // 10. Redirect to dashboard
    // ==========================================
    const response = NextResponse.redirect(
      new URL("/dashboard", request.url)
    );

    // ==========================================
    // 11. Set auth cookie
    // ==========================================
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    // ==========================================
    // 12. Remove OAuth state cookie
    // ==========================================
    response.cookies.set({
      name: "google_oauth_state",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error(
      "Google OAuth callback error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}