import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/password";
import { createToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // 1. Read request body
    const body = await request.json();

    const { email, password } = body;

    // 2. Validate input
    if (!email || !password) {
      return Response.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // 3. Find user in database
    const user = await prisma.user.findUnique({
      where: {
        email,
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

    // 4. User does not exist
    if (!user) {
      console.log("LOGIN EMAIL:", email);
      console.log("USER FOUND:", false);

      return Response.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    console.log("LOGIN EMAIL:", email);
    console.log("USER FOUND:", true);

    // 5. Compare password
    const passwordValid = await comparePassword(
      password,
      user.password
    );

    console.log("PASSWORD VALID:", passwordValid);

    // 6. Invalid password
    if (!passwordValid) {
      return Response.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // 7. Create JWT token
    const token = await createToken(user.id);

    // 8. Create login response
    const response = Response.json({
      success: true,
      message: "Login successful",

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    });

    // 9. Store JWT in HTTP-only cookie
    response.headers.append(
      "Set-Cookie",
      `auth_token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${
        process.env.NODE_ENV === "production"
          ? "; Secure"
          : ""
      }`
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}