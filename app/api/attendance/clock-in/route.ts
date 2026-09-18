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

    // 3. Check if user already has an active attendance
    const activeAttendance = await prisma.attendance.findFirst({
      where: {
        userId: currentUser.id,
        clockOut: null,
      },
      orderBy: {
        clockIn: "desc",
      },
    });

    if (activeAttendance) {
      return Response.json(
        {
          success: false,
          message: "You are already clocked in",
          attendance: {
            id: activeAttendance.id,
            clockIn: activeAttendance.clockIn,
          },
        },
        { status: 400 }
      );
    }

    // 4. Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        userId: currentUser.id,
        clockIn: new Date(),
      },
    });

    // 5. Return result
    return Response.json(
      {
        success: true,
        message: "Clock-in successful",
        attendance: {
          id: attendance.id,
          clockIn: attendance.clockIn,
          clockOut: attendance.clockOut,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Clock-in error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}