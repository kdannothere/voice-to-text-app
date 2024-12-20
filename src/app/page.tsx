"use client";

import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useUser } from "@clerk/nextjs";

// defaults
const TIER_1 = 5;
const TIER_2 = 20;
const TIER_3 = 50;
const TIER_4 = 100;

export default function Home() {
  const { user, isLoaded } = useUser();
  const [tier, setTier] = useState(TIER_1);
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 1) {
      alert("Only one file allowed. Please select a single file.");
      return;
    }
    setFiles(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleAssociateUser = async (user: any) => {
    if (!user) return;

    const clerkUser = {
      id: user.id,
      email: user.emailAddresses[0].emailAddress,
    };

    try {
      const response = await fetch("/api/user/associate-with-clerk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clerkUser),
      });

      if (!response.ok) {
        alert("Something went wrong...");
        console.error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      alert("Something went wrong...");
      console.error("Error associating user:", error);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      handleAssociateUser(user);
    }
  });

  return (
    <div className='flex justify-center items-center min-h-[100vh]'>
      <div className='w-[500px] flex flex-col items-center px-8 my-20 overflow-y-auto'>
        <h1 className='font-bold text-3xl mb-8'>Audio Transcription</h1>
        <div
          className='mb-8 px-8 py-12 border-2 border-dashed cursor-pointer'
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className='text-gray-500'>Drop the files here ...</p>
          ) : (
            <div className='text-gray-500 text-sm'>
              <p>
                Drag &#39;n&#39; drop a file here, or click to select a file
              </p>
              <p>Supported formats: MP3, WAV, M4A (max 25MB)</p>
            </div>
          )}
        </div>
        <div>
          <h2 className='mb-1 text-center font-bold text-2xl'>
            Support Our Work
          </h2>
          <p className='text-center mb-4 text-gray-500 text-sm'>
            Choose your support tier and help us keep this service running
          </p>
          <p className='mb-1 text-center font-bold text-2xl'>
            <span>$</span>
            <span>{tier}</span>
          </p>
          <p className='flex flex-nowrap justify-center mb-4'>
            <Image
              src={"/coffee-black.png"}
              alt={"Coffee icon"}
              width={24}
              height={24}
            ></Image>
            <span className='ml-2 text-gray-500 text-sm'>
              Basic Support - Help us keep the lights on
            </span>
          </p>
          <div className='tier-list flex justify-center mb-5'>
            <Tier
              active={tier === TIER_1}
              chooseTier={() => setTier(TIER_1)}
              price={TIER_1}
            />
            <Tier
              active={tier === TIER_2}
              chooseTier={() => setTier(TIER_2)}
              price={TIER_2}
            />
            <Tier
              active={tier === TIER_3}
              chooseTier={() => setTier(TIER_3)}
              price={TIER_3}
            />
            <Tier
              active={tier === TIER_4}
              chooseTier={() => setTier(TIER_4)}
              price={TIER_4}
            />
          </div>
          <form className='flex' action=''>
            <button className='w-full mx-6 py-2 text-center mb-4 text-white bg-blue-500 hover:bg-blue-600 rounded-md'>
              <span className='pr-1'>Support with</span>
              <span>$</span>
              <span>{tier}</span>
            </button>
          </form>
          <p className='text-center text-xs text-gray-500'>
            Secure payment powered by Stripe
          </p>
        </div>
      </div>
    </div>
  );
}

function Tier({
  price,
  chooseTier,
  active,
}: {
  price: number;
  chooseTier: () => void;
  active: boolean;
}) {
  return (
    <div
      onClick={chooseTier}
      className={`mx-4 p-2 flex-1 text-center rounded-lg cursor-pointer hover:bg-blue-300 ${
        active ? "bg-blue-500 text-white" : "bg-gray-200"
      }`}
    >
      <p>
        <span>$</span>
        <span>{price}</span>
      </p>
    </div>
  );
}
