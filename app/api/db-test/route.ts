import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.$queryRaw<
      { now: Date }[]
    >`SELECT NOW() as now`;

    return Response.json({
      success: true,
      message: "Database connected successfully",
      databaseTime: result[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return Response.json(
      {
        success: false,
        message: "Database connection failed",
      },
      { status: 500 }
    );
  }
}