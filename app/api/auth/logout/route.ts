export async function POST() {
  try {
    const response = Response.json({
      success: true,
      message: "Logout successful",
    });

    response.headers.append(
      "Set-Cookie",
      "auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
    );

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}