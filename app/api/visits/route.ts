import { Permission } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { hasPermission } from "@/lib/permissions";

// ==========================================
// POST /api/visits
// Create a new visit
// ==========================================
export async function POST(request: Request) {
  try {
    // 1. Get logged-in user
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

    // 2. Check SAVE_VISIT permission
    if (
      !hasPermission(
        currentUser.permissions,
        Permission.SAVE_VISIT
      )
    ) {
      return Response.json(
        {
          success: false,
          message: "You do not have permission to save visits",
        },
        { status: 403 }
      );
    }

    // 3. Read request body
    const body = await request.json();

    const {
      customerName,
      purpose,
      outcome,
      location,
      visitDate,
    } = body;

    // 4. Validate fields
    if (
      !customerName ||
      !purpose ||
      !outcome ||
      !location ||
      !visitDate
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Customer name, purpose, outcome, location and visit date are required",
        },
        { status: 400 }
      );
    }

    // 5. Validate date
    const parsedVisitDate = new Date(visitDate);

    if (Number.isNaN(parsedVisitDate.getTime())) {
      return Response.json(
        {
          success: false,
          message: "Invalid visit date",
        },
        { status: 400 }
      );
    }

    // 6. Create visit
    const visit = await prisma.visit.create({
      data: {
        userId: currentUser.id,
        customerName,
        purpose,
        outcome,
        location,
        visitDate: parsedVisitDate,
      },
    });

    // 7. Response
    return Response.json(
      {
        success: true,
        message: "Visit saved successfully",
        visit: {
          id: visit.id,
          customerName: visit.customerName,
          purpose: visit.purpose,
          outcome: visit.outcome,
          location: visit.location,
          visitDate: visit.visitDate,
          userId: visit.userId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Save visit error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}

// ==========================================
// GET /api/visits
// Read visits based on permissions
// ==========================================
export async function GET() {
  try {
    // 1. Get logged-in user
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
      Permission.READ_ALL_VISIT
    );

    const canReadSelf = hasPermission(
      currentUser.permissions,
      Permission.READ_SELF_VISIT
    );

    // 3. No permission
    if (!canReadAll && !canReadSelf) {
      return Response.json(
        {
          success: false,
          message: "You do not have permission to view visits",
        },
        { status: 403 }
      );
    }

    // 4. Fetch visits
    const visits = await prisma.visit.findMany({
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
        visitDate: "desc",
      },
    });

    // 5. Response
    return Response.json({
      success: true,
      count: visits.length,
      visits,
    });
  } catch (error) {
    console.error("Get visits error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}