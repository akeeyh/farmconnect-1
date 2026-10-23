import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};

    if (session.role === "FARMER") {
      where.farmerId = session.userId;
    } else {
      where.buyerId = session.userId;
    }

    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, unit: true, images: true },
            },
          },
        },
        buyer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        farmer: {
          select: {
            id: true,
            name: true,
            farmProfile: {
              select: { farmName: true, location: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { items, deliveryAddress, paymentMethod, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required" },
        { status: 400 }
      );
    }

    // Group items by farmer
    const itemsByFarmer: Record<
      string,
      Array<{ productId: string; quantity: number }>
    > = {};

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      if (!product.isAvailable || product.quantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.name}. Available: ${product.quantity}`,
          },
          { status: 400 }
        );
      }

      if (!itemsByFarmer[product.farmerId]) {
        itemsByFarmer[product.farmerId] = [];
      }
      itemsByFarmer[product.farmerId].push({
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    // Create one order per farmer
    const createdOrders = [];

    for (const [farmerId, farmerItems] of Object.entries(itemsByFarmer)) {
      let totalAmount = 0;
      const orderItems = [];

      for (const item of farmerItems) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) continue;

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
          total: itemTotal,
        });

        // Deduct inventory
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            quantity: { decrement: item.quantity },
            isAvailable: product.quantity - item.quantity > 0,
          },
        });
      }

      const deliveryFee = totalAmount > 500 ? 0 : 30;

      const order = await prisma.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          buyerId: session.userId,
          farmerId,
          totalAmount: totalAmount + deliveryFee,
          deliveryFee,
          deliveryAddress: deliveryAddress || null,
          paymentMethod: paymentMethod || "COD",
          notes: notes || null,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, unit: true } },
            },
          },
          farmer: {
            select: {
              id: true,
              name: true,
              farmProfile: { select: { farmName: true } },
            },
          },
        },
      });

      createdOrders.push(order);

      // Create notification for farmer
      await prisma.notification.create({
        data: {
          userId: farmerId,
          title: "New Order Received",
          message: `You have a new order #${order.orderNumber} worth ₹${order.totalAmount}`,
          type: "ORDER",
          link: `/farmer/orders`,
        },
      });
    }

    // Clear buyer's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
    });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return NextResponse.json({ orders: createdOrders }, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
