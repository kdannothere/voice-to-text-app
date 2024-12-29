import { NextResponse } from "next/server";
import { prisma } from "../../prismaClient";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const intentId = data.intentId;
    const userClerkId = data.userClerkId;
    const paymentExists = await prisma.payment.findFirst({
      where: {
        intentId: intentId,
      },
    });

    const user = await prisma.user.findFirst({
      where: {
        clerkId: userClerkId,
      },
    });

    // Create Payment
    if (!paymentExists && user) {
      const payment = {
        intentId: intentId,
        userId: user.id,
      };

      await prisma.payment.create({
        data: payment,
      });
      return new NextResponse(JSON.stringify({ result: "success" }));
    }

    if (paymentExists) {
      return new NextResponse(JSON.stringify({ result: "exists" }));
    }

    // unexpected result
    return new NextResponse(JSON.stringify({ result: "unexpected" }));
  } catch (error: any) {
    console.error("Error storing a payment:", error.message);
    return new NextResponse(JSON.stringify({ result: "error" }));
  }
}
