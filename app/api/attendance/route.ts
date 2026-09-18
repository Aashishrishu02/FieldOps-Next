import { Permission } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { hasPermission } from "@/lib/permissions";

export async function GET() {
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

    // 2. Check permissions
    const canReadAll = hasPermission(
      currentUser.permissions,
      Permission.READ_ALL_ATTENDANCE
    );

    const canReadSelf = hasPermission(
      currentUser.permissions,
      Permission.READ_SELF_ATTENDANCE
    );

    if (!canReadAll && !canReadSelf) {
      return Response.json(
        {
          success: false,
          message: "You do not have permission to view attendance",
        },
        { status: 403 }
      );
    }

    // 3. Decide which attendance records user can see
    const attendance = await prisma.attendance.findMany({
      where: canReadAll
        ? {}
        : {
            userId: currentUser.id,
          },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        clockIn: "desc",
      },
    });

    // 4. Return attendance
    return Response.json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error("Get attendance error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}