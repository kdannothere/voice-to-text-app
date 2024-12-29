import { prisma } from "../../prismaClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const clerkUserId = data.clerkUserId;
    const user = await prisma.user.findFirst({
      where: {
        clerkId: clerkUserId,
      },
    });

    // get credits
    if (user) {
      return new NextResponse(
        JSON.stringify({ result: "success", credits: user.credits })
      );
    }

    return new NextResponse(JSON.stringify({ result: "user-not-found" }));
  } catch (error: any) {
    console.error("Error adding credits to user:", error.message);
    return new NextResponse(JSON.stringify({ result: "error" }));
  }
}
