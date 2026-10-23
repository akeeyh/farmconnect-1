import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const farmingType = searchParams.get("farmingType");
    const farmerId = searchParams.get("farmerId");
    const available = searchParams.get("available");

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = { name: category };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, unknown>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, unknown>).lte = parseFloat(maxPrice);
    }
    if (farmingType) {
      where.farmingType = farmingType;
    }
    if (farmerId) {
      where.farmerId = farmerId;
    }
    if (available !== "false") {
      where.isAvailable = true;
      where.quantity = { gt: 0 };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            farmProfile: {
              select: {
                farmName: true,
                location: true,
                farmingType: true,
              },
            },
          },
        },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Get products error:", error);
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
      return NextResponse.json(
        { error: "Only farmers can create products" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      unit,
      quantity,
      categoryId,
      harvestDate,
      freshnessDays,
      farmingType,
      minOrderQty,
    } = body;

    if (!name || !price || !quantity || !categoryId) {
      return NextResponse.json(
        { error: "Name, price, quantity, and category are required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        unit: unit || "kg",
        quantity: parseFloat(quantity),
        minOrderQty: minOrderQty ? parseFloat(minOrderQty) : 1,
        categoryId,
        farmerId: session.userId,
        harvestDate: harvestDate ? new Date(harvestDate) : null,
        freshnessDays: freshnessDays ? parseInt(freshnessDays) : null,
        farmingType: farmingType || "Conventional",
      },
      include: {
        category: true,
        farmer: {
          select: { id: true, name: true, farmProfile: true },
        },
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
