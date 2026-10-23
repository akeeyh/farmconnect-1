import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const profile = await prisma.farmProfile.findUnique({
      where: { userId: session.userId },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Get farm profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "FARMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { farmName, location, address, farmSize, farmSizeUnit, farmingType, description } = body;

    if (!farmName || !location) {
      return NextResponse.json(
        { error: "Farm name and location are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.farmProfile.findUnique({
      where: { userId: session.userId },
    });

    let profile;
    if (existing) {
      profile = await prisma.farmProfile.update({
        where: { userId: session.userId },
        data: {
          farmName,
          location,
          address: address || null,
          farmSize: farmSize ? parseFloat(farmSize) : null,
          farmSizeUnit: farmSizeUnit || "acres",
          farmingType: farmingType || "Conventional",
          description: description || null,
        },
      });
    } else {
      profile = await prisma.farmProfile.create({
        data: {
          userId: session.userId,
          farmName,
          location,
          address: address || null,
          farmSize: farmSize ? parseFloat(farmSize) : null,
          farmSizeUnit: farmSizeUnit || "acres",
          farmingType: farmingType || "Conventional",
          description: description || null,
        },
      });
    }

    return NextResponse.json({ profile }, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error("Farm profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
