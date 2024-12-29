import { prisma } from "../../prismaClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const clerkUser = data.clerkUser;
    const credits = data.credits;
    const user = await prisma.user.findFirst({
      where: {
        clerkId: clerkUser.id,
      },
    });

    // Add credits to user
    if (user) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          credits: user.credits + credits,
        },
      });
    }
    return new NextResponse(JSON.stringify({result: 'success'}));
  } catch (error: any) {
    console.error("Error adding credits to user:", error.message);
    return new NextResponse(JSON.stringify({result: 'error'}));
  }
}
