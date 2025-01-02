import { prisma } from "../../prismaClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const record = data.record;
    const existingRecord = await prisma.record.findFirst({
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

    // Create Record
    if (!existingRecord && user) {
      const newRecord = {
        title: record.title,
        content: record.content,
        authorId: user.id,
      };

      await prisma.record.create({
        data: newRecord,
      });
    }

    // if exists then update it
    if (existingRecord && user) {
      await prisma.record.update({
        where: { id: existingRecord.id },
        data: {title: existingRecord.title},
      });
    }
    return new NextResponse(JSON.stringify({ result: "success" }));
  } catch (error: any) {
    console.error("Error storing a record:", error.message);
    return new NextResponse(JSON.stringify({ result: "error" }));
  }
}
