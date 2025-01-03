import { SpeechClient } from "@google-cloud/speech/build/src/v1";
import { IFormat } from "music-metadata";
import { NextResponse } from "next/server";
import { prisma } from "../prismaClient";

export async function POST(req: Request) {
  try {
    const jsonString = JSON.stringify(
      process.env.GOOGLE_CLOUD_SPEECH_TO_TEXT_KEY || {}
    );

    // Create a Blob object with the JSON string and specify the content type
    const blob = new Blob([jsonString], { type: "text/plain" });
    const file = new File([blob], "voice-to-text-446221-33b1d409a2f8.json", {
      type: blob.type,
    });

    // Create a URL for the File object
    const fileURL = URL.createObjectURL(file);

    const speechClient = new SpeechClient({
      keyFile: fileURL,
    });

    const data = await req.json();
    const fileEncoded: string = data.fileEncoded;
    const fileMeta: IFormat = data.fileMeta;
    const languageCode: string = data.languageCode;
    const clerkUserId = data.clerkUser;
    const user = await prisma.user.findFirst({
      where: {
        clerkId: clerkUserId,
      },
    });

    if (user && user.credits < 1) {
      return new NextResponse(
        JSON.stringify({
          data: "no-credits",
        })
      );
    }

    const creditsUpdated = user ? user.credits - 1 : 0;

    // take credits from user
    if (user) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          credits: creditsUpdated,
        },
      });
    }

    const request = {
      audio: {
        content: fileEncoded,
      },
      config: {
        languageCode: languageCode,
        audioChannelCount: fileMeta?.numberOfChannels,
        sampleRateHertz: fileMeta?.sampleRate,
        enableSeparateRecognitionPerChannel: true,
        profanityFilter: true,
      },
    };
    const [response] = await speechClient.recognize(request);

    return new NextResponse(
      JSON.stringify({
        data: response,
        credits: creditsUpdated,
      })
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error during converting:", error.message);
    return new NextResponse(
      JSON.stringify({
        data: "error",
      })
    );
  }
}
