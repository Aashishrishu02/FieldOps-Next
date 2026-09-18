import { Permission } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { hasPermission } from "@/lib/permissions";

export async function POST() {
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

    // 2. Permission check
    if (
      !hasPermission(
        currentUser.permissions,
        Permission.CLOCK_IN_OUT
      )
    ) {
      return Response.json(
        {
          success: false,
          message: "You do not have permission to clock in/out",
        },
        { status: 403 }
      );
    }

    // 3. Find active attendance
    const activeAttendance = await prisma.attendance.findFirst({
      where: {
        userId: currentUser.id,
        clockOut: null,
      },
      orderBy: {
        clockIn: "desc",
      },
    });

    // 4. No active attendance
    if (!activeAttendance) {
      return Response.json(
        {
          success: false,
          message: "You are not currently clocked in",
        },
        { status: 400 }
      );
    }

    // 5. Clock out
    const attendance = await prisma.attendance.update({
      where: {
        id: activeAttendance.id,
      },
      data: {
        clockOut: new Date(),
      },
    });

    // 6. Return result
    return Response.json({
      success: true,
      message: "Clock-out successful",
      attendance: {
        id: attendance.id,
        clockIn: attendance.clockIn,
        clockOut: attendance.clockOut,
      },
    });
  } catch (error) {
    console.error("Clock-out error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}