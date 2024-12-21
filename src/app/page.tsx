"use client";

import Image from "next/image";
import { useState, useCallback, useEffect, FormEvent } from "react";
import { useDropzone } from "react-dropzone";
import { useUser } from "@clerk/nextjs";
import { Record } from "./utils/Record";

// defaults
const TIER_1 = 5;
const TIER_2 = 20;
const TIER_3 = 50;
const TIER_4 = 100;

export default function Home() {
  const [isLoadedInit, setIsLoadedInit] = useState(false);

  const { user, isLoaded } = useUser();
  const [tier, setTier] = useState(TIER_1);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(
    "Blanditiis dolores minima, magnam tempore possimus ex voluptates obcaecati iusto nesciunt, quos dolorum architecto, consectetur beatae quidem qui amet temporibus! Eligendi."
  );
  const [records, setRecords] = useState();
  const [loadingRecords, setLoadingRecords] = useState(true);

  const onDrop = useCallback((acceptedFile) => {
    setFile(acceptedFile);
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

  const handleAddCreditsToUser = async (user: any) => {
    if (!user) return;

    const clerkUser = {
      id: user.id,
      email: user.emailAddresses[0].emailAddress,
    };

    try {
      const response = await fetch("/api/user/add-credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clerkUser: clerkUser, credits: tier * 10 }),
      });

      if (!response.ok) {
        alert("Something went wrong...");
        console.error(`HTTP error! status: ${response.status}`);
      }
      const result = (await response.json()).result;
      if (result === "success") {
        alert("Success");
      }
    } catch (error) {
      alert("Something went wrong...");
      console.error("Error associating user:", error);
    }
  };

  const handleStoreRecord = async (
    event: FormEvent<HTMLFormElement>,
    user: any,
    result: string,
    records: any
  ) => {
    event.preventDefault();
    if (!user) {
      alert("Login or register, please.");
      return;
    }
    if (records.length === 2) {
      alert("It's time to pay, body");
      return;
    }

    const record = {
      title: result.substring(0, 40),
      content: result,
      clerkId: user.id,
    };
    try {
      const response = await fetch("/api/record/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          record: record,
          recordsNumber: records.length || 0,
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
        if (result === "no-credits") {
          alert("Not enough credits. Please buy more.");
        }
      }
    } catch (error) {
      alert("Something went wrong...");
      console.error("Error storing the record:", error);
    }
  };

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

  // prevent unnecessary db calls
  useEffect(() => {
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
      {records && <SidePanel records={records} />}
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
        {file && (
          <form
            onSubmit={(event) =>
              handleStoreRecord(event, user, result, records)
            }
            className='flex'
          >
            <button className='w-full mx-6 px-6 py-2 text-center mb-8 text-white bg-blue-500 hover:bg-blue-600 rounded-md'>
              Convert
            </button>
          </form>
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
          {/* <div className='flex'>
            <button className='w-full mx-6 py-2 text-center mb-4 text-white bg-blue-500 hover:bg-blue-600 rounded-md'>
              <span className='pr-1'>Support with</span>
              <span>$</span>
              <span>{tier}</span>
            </button>
          </div> */}
          <div className='flex justify-center mb-4 py-2'>
            <stripe-buy-button
              buy-button-id='buy_btn_1QYRySEPQ7pJs9Cfb9r1qreL'
              publishable-key='pk_test_51QYDdVEPQ7pJs9Cf7V8ixrnVOandmfAg9sn1Pk9Ji7Jll4bNiXrWc4tpyRegKte6noEKKoql6L04WLr4dbruny2800av2fFV0W'
            ></stripe-buy-button>
          </div>
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

function SidePanel({ records }: { records: Record[] }) {
  const [show, setShow] = useState(false);
  let key = 1;
  return (
    <>
      {show ? (
        <div className='side-panel w-80 absolute left-5 top-5 border-4 p-4 pb-8 border-dashed bg-slate-100'>
          <Image
            onClick={() => setShow(!show)}
            className='cursor-pointer'
            src={"/side-panel.png"}
            alt={"Side panel"}
            width={24}
            height={24}
          ></Image>
          <h3 className='font-bold text-lg my-4'>History</h3>
          {records.length ? (
            <ul>
              {records.slice(0, 10).map((record) => (
                <li
                  className='text-nowrap overflow-hidden text-ellipsis'
                  key={key++}
                >{`${key}. ${record.title}`}</li>
              ))}
            </ul>
          ) : (
            <p>There are no records yet.</p>
          )}
        </div>
      ) : (
        <div className='side-panel absolute left-10 top-10'>
          <Image
            onClick={() => setShow(!show)}
            className='cursor-pointer'
            src={"/side-panel.png"}
            alt={"Side panel"}
            width={24}
            height={24}
          ></Image>
        </div>
      )}
    </>
  );
}
