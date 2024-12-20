import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function POST(req: Request) {
  const clerkUser = await req.json();
  try {
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
            { clerkId: clerkUser.id },  // Check for existing user by clerkId
            { email: clerkUser.email }, // Check for existing user by email
          ],
        },
      });
      
      if (!existingUser) {
        console.log("Create a new user");
        const newUser = {
          email: clerkUser.email,
          clerkId: clerkUser.id,
        };
        await prisma.user.create({
          data: newUser,
        });
      }
    }
  } catch (error: any) {
    console.error("Error associating user:", error.message);
  } finally {
    return new NextResponse();
  }
}
