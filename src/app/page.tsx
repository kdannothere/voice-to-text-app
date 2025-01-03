/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { useState, useCallback, useEffect, useContext } from "react";
import { useDropzone } from "react-dropzone";
import { useUser } from "@clerk/nextjs";
import { IFormat, parseBuffer } from "music-metadata";
import { Record } from "./utils/Record";
import Link from "next/link";
import Tier from "./components/Tier";
import SidePanel from "./components/SidePanel";
import { isFileFormatSupported } from "./utils/format-util";
import { Language } from "./utils/languages";
import LanguageSelector, { loadLanguage } from "./components/LanguageSelector";
import { AppContext } from "./AppContext";
import { TIER_1, TIER_2, TIER_3, TIER_4 } from "./utils/constants";

export default function Home() {
  const [isLoadedInit, setIsLoadedInit] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const { user } = useUser();
  const { setCredits } = useContext(AppContext);
  const [tier, setTier] = useState(TIER_1);
  const [file, setFile] = useState<any>(null);
  const [fileEncoded, setFileEncoded] = useState("");
  const [fileMeta, setFileMeta] = useState<IFormat | null>(null);
  const [result, setResult] = useState("");
  const [records, setRecords] = useState<Record[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null
  );

  const onDrop = useCallback((acceptedFile: any) => {
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        if (reader.result) {
          const arrayBuffer = reader.result as ArrayBuffer;
          const base64EncodedAudio =
            Buffer.from(arrayBuffer).toString("base64");
          const { format } = await parseBuffer(Buffer.from(arrayBuffer));
          setFileMeta(format);
          setFileEncoded(base64EncodedAudio);
          setFile(acceptedFile[0]);
        }
      } catch (error) {
        console.error("Error reading audio properties:", error);
      }
    };
    if (isFileFormatSupported(acceptedFile[0].name)) {
      reader.readAsArrayBuffer(acceptedFile[0]);
    } else {
      setFile(null);
      setFileEncoded("");
      alert("File format is not supported.");
    }
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

  const handleStoreRecord = useCallback(
    async (user: any, result: string, records: any) => {
      try {
        const record = {
          title: result.substring(0, 40),
          content: result,
          clerkId: user.id,
        };
        const response = await fetch("/api/record/store", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            record: record,
            recordsNumber: records.length,
          }),
        });

        if (!response.ok) {
          alert("Something went wrong...");
          console.error(`HTTP error! status: ${response.status}`);
        } else {
          const result = (await response.json()).result;

          // update records history in the side panel
          if (result === "success") {
            fetchRecords(user);
          }
        }
      } catch (error) {
        alert("Something went wrong...");
        console.error("Error storing the record:", error);
      }
    },
    []
  );

  const fetchRecords = async (user: any) => {
    if (!user) {
      alert("Login or register, please.");
      return;
    }
    const data = [];
    try {
      const response = await fetch("/api/record/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
      if (!response.ok) {
        alert("Something went wrong...");
        console.error(`HTTP error! status: ${response.status}`);
      }
      const _data = await response.json();
      if (_data && _data.length) {
        data.push(_data);
        setRecords(data[0]);
      }
    } catch (error) {
      alert("Something went wrong...");
      console.error("Error fetching the records:", error);
    }
  };

  const handleConvert = useCallback(async () => {
    try {
      setIsConverting(true);
      setResult("");
      if (!user) {
        alert("Login or register, please.");
        return;
      }

      if (!fileEncoded) {
        alert("Load the file first, please.");
        return;
      }

      const response = await fetch("/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileEncoded: fileEncoded,
          fileMeta: fileMeta,
          languageCode: selectedLanguage?.code,
          clerkUserId: user.id,
        }),
      });

      if (!response.ok) {
        // alert("Something went wrong...");
        console.error(`HTTP error! status: ${response.status}`);
        return;
      }
      const data = await response.json();
      if (data.data === "error") {
        alert("This file cannot be converted.");
        return;
      }
      if (data.data === "no-credits") {
        alert("Not enough credits. Please buy more.");
        return;
      }
      const transcript = data.data.results[0].alternatives[0].transcript || "";
      setCredits(data.credits);
      if (transcript) {
        setResult(transcript);
        handleStoreRecord(user, transcript, records);
      } else {
        alert("0 words were recognized.");
      }
    } catch (error) {
      // alert("Something went wrong...");
      console.error("Error converting the audio file:", error);
    } finally {
      setIsConverting(false);
    }
  }, [
    fileEncoded,
    fileMeta,
    handleStoreRecord,
    records,
    selectedLanguage?.code,
    setCredits,
    user,
  ]);

  // prevent unnecessary db calls and load language
  useEffect(() => {
    setSelectedLanguage(loadLanguage());
    setIsLoadedInit(true);
  }, []);

  useEffect(() => {
    if (isLoadedInit && user) {
      handleAssociateUser(user);
    }
  }, [isLoadedInit, user]);

  useEffect(() => {
    if (isLoadedInit && loadingRecords && user) {
      fetchRecords(user);
      setLoadingRecords(false);
    }
  }, [isLoadedInit, loadingRecords, user]);

  return (
    <div className='flex justify-center items-center min-h-[100vh]'>
      <SidePanel records={records} />
      <div
        className={`w-[500px] flex flex-col items-center px-8 my-20 overflow-y-auto`}
      >
        <h1 className='font-bold text-3xl mb-8'>Audio Transcription</h1>
        <div className='mb-8'>
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
          />
        </div>
        <div
          className='mb-8 px-8 py-12 border-2 border-dashed cursor-pointer'
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className='text-gray-500'>Drop the file here...</p>
          ) : (
            <div className='text-gray-500 text-sm'>
              <p className='mb-4'>
                Drag &#39;n&#39; drop a file here, or click to select a file.
              </p>
              <p className='mb-4'>
                Supported formats: MP3, WAV, FLAC, OGG, RAW.
              </p>
              <p>File&apos;s max size is 10MB and max duration is 1 minute.</p>
            </div>
          )}
        </div>
        {file != null && (
          <div className='px-8 flex flex-col items-center'>
            <p className='font-bold'>File name:</p>
            <p className='mb-8'>{file.name}</p>
            <button
              onClick={() => handleConvert()}
              disabled={isConverting}
              className={`w-fit mx-6 px-16 py-2 text-center mb-8 text-white bg-blue-500 rounded-md ${
                isConverting
                  ? "bg-blue-200 hover:bg-blue-300"
                  : "hover:bg-blue-600"
              }`}
            >
              Convert
            </button>
          </div>
        )}
        <div className='mb-8'>
          {result && (
            <div>
              <h2 className='font-bold text-center text-lg mb-2'>Result</h2>
              <p className='py-4 px-8 border-2 overflow-hidden'>{result}</p>
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
              You will get {tier * 10} credits
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
          <div className='flex'>
            <Link
              href={`/payment?tier=${tier}`}
              className='w-full mx-6 py-2 text-center mb-4 text-white bg-blue-500 hover:bg-blue-600 rounded-md'
            >
              <span className='pr-1'>Support with</span>
              <span>$</span>
              <span>{tier}</span>
            </Link>
          </div>
          <p className='text-center text-xs text-gray-500'>
            Secure payment powered by Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
