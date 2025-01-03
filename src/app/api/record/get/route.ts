import { prisma } from "../../prismaClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let records = null;
  try {
    const clerkUser = await req.json();

    const user = await prisma.user.findFirst({
      where: {
        clerkId: clerkUser.id,
      },
    });

    if (user) {
      const _records = await prisma.record.findMany({
        where: {
          authorId: user.id,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 10, // Limit the number of returned records
      });
      records = _records;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error fetching the records:", error.message);
  } finally {
    return new NextResponse(JSON.stringify(records));
  }
}
