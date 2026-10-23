import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET active bulk requirements
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    
    const requirements = await prisma.bulkRequirement.findMany({
      where: { isActive: true },
      include: {
        buyer: {
          select: { id: true, name: true, role: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ requirements });
  } catch (error) {
    console.error("Get bulk requirements error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST a new bulk requirement (Buyers only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role === "FARMER") {
      return NextResponse.json({ error: "Only buyers can post requirements" }, { status: 403 });
    }

    const body = await request.json();
    const { productName, quantity, unit, frequency, priceMin, priceMax, duration, description } = body;

    if (!productName || !quantity) {
      return NextResponse.json(
        { error: "Product name and quantity are required" },
        { status: 400 }
      );
    }

    const requirement = await prisma.bulkRequirement.create({
      data: {
        productName,
        quantity: parseFloat(quantity),
        unit: unit || "kg",
        frequency,
        priceMin: priceMin ? parseFloat(priceMin) : null,
        priceMax: priceMax ? parseFloat(priceMax) : null,
        duration,
        description,
        buyerId: session.userId,
      }
    });

    return NextResponse.json({ requirement }, { status: 201 });
  } catch (error) {
    console.error("Create bulk requirement error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
