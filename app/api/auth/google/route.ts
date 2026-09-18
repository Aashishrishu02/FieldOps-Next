import crypto from "crypto";
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return Response.json(
        {
          success: false,
          message: "Google OAuth configuration is missing",
        },
        { status: 500 }
      );
    }

    // Create Google OAuth client
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    // Random state for CSRF protection
    const state = crypto.randomBytes(32).toString("hex");

    // Generate Google authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "openid",
        "email",
        "profile",
      ],
      state,
      prompt: "select_account",
    });

    // Redirect user to Google
    const response = NextResponse.redirect(authUrl);

    // Store OAuth state in HTTP-only cookie
    response.cookies.set({
      name: "google_oauth_state",
      value: state,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });

    return response;
  } catch (error) {
    console.error("Google OAuth start error:", error);

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