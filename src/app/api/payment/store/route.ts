import { NextResponse } from "next/server";
import { prisma } from "../../prismaClient";

// store successful payment and add credits to user
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const intentId = data.intentId;
    const userClerkId = data.userClerkId;
    const tier: number = data.tier;
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

      const creditsUpdated = user.credits + tier * 10;

      // Add credits to user
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          credits: creditsUpdated,
        },
      });
      return new NextResponse(
        JSON.stringify({ result: "success", creditsUpdated: creditsUpdated })
      );
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
