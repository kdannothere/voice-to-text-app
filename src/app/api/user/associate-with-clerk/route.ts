import { prisma } from "../../prismaClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const clerkUser = await req.json();
    const users = await prisma.user.findMany({
      where: {
        clerkId: null,
      },
    });

    // Update Clerk ID for existing user
    if (users.length) {
      await prisma.user.update({
        where: {
          id: users[0].id,
        },
        data: {
          clerkId: clerkUser.id,
        },
      });
    } else {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { clerkId: clerkUser.id }, // Check for existing user by clerkId
            { email: clerkUser.email }, // Check for existing user by email
          ],
        },
      });

      if (!existingUser) {
        const newUser = {
          email: clerkUser.email,
          clerkId: clerkUser.id,
        };
        await prisma.user.create({
          data: newUser,
        });
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error associating user:", error.message);
  } finally {
    return new NextResponse();
  }
}
