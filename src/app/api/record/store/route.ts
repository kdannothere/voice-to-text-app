import { prisma } from "../../prismaClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const record = data.record;
    const recordExists = await prisma.record.findFirst({
      where: {
        title: record.title,
        content: record.content,
      },
    });

    const user = await prisma.user.findFirst({
      where: {
        clerkId: record.clerkId,
      },
    });

    if (user && user.credits < 1 && data.recordsNumber > 1) {
      return new NextResponse(JSON.stringify({ result: "no-credits" }));
    }

    // Create Record
    if (!recordExists && user) {
      const newRecord = {
        title: record.title,
        content: record.content,
        authorId: user.id,
      };

      await prisma.record.create({
        data: newRecord,
      });
    }
    return new NextResponse(JSON.stringify({ result: "success" }));
  } catch (error: any) {
    console.error("Error storing a record:", error.message);
    return new NextResponse(JSON.stringify({ result: "error" }));
  }
}
