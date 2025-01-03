"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useContext, useEffect } from "react";
import { AppContext } from "../AppContext";

export default function Credits({}) {
  const { user } = useUser();
  const { credits, setCredits } = useContext(AppContext);

  const fetchCredits = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (user: any) => {
      try {
        const response = await fetch("/api/user/get-credits", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ clerkUserId: user.id }),
        });
        if (!response.ok) {
          alert("Something went wrong...");
          console.error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.result === "success") {
          setCredits(data.credits);
          return;
        }
        if (data.result === "user-not-found") {
          console.error("user-not-found in fetchCredits()");
          return;
        }
        console.log("Unexpected case in fetchCredits()");
      } catch (error) {
        alert("Something went wrong...");
        console.error("Error fetching the credits:", error);
      }
    },
    [setCredits]
  );

  useEffect(() => {
    if (user) {
      fetchCredits(user);
    }
  }, [user, fetchCredits]);

  return (
    <>
      {user && credits && (
        <p className='text-nowrap text-center'>Credits: {credits}</p>
      )}
    </>
  );
}
