import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
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
            phone: true,
            farmProfile: {
              select: { farmName: true, location: true },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only allow buyer or farmer to see the order
    if (
      order.buyerId !== session.userId &&
      order.farmerId !== session.userId &&
      session.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only the farmer can update order status (except cancel by buyer)
    if (status === "CANCELLED" && order.buyerId === session.userId) {
      // Restore inventory
      const items = await prisma.orderItem.findMany({
        where: { orderId: id },
      });
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            quantity: { increment: item.quantity },
            isAvailable: true,
          },
        });
      }
    } else if (order.farmerId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        paymentStatus:
          status === "DELIVERED" ? "COMPLETED" : order.paymentStatus,
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, unit: true } },
          },
        },
      },
    });

    // Notify buyer of status change
    await prisma.notification.create({
      data: {
        userId: order.buyerId,
        title: "Order Status Updated",
        message: `Order #${order.orderNumber} is now ${status.replace(/_/g, " ").toLowerCase()}`,
        type: "ORDER",
        link: `/orders/${order.id}`,
      },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
