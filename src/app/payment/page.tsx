"use client";

import {
  Appearance,
  loadStripe,
  StripeElementsOptions,
} from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./../components/CheckoutForm";
import CompletePage from "./../components/CompletePage";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { TIER_1, TIER_4 } from "../utils/constants";
import { getSearchParams } from "../utils/helpers";

// avoid recreating the Stripe object on every render.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

function getTier(value: string): number {
  const price = Number(value);
  if (price >= TIER_1 && price <= TIER_4) {
    return price;
  }
  return TIER_1;
}

export default function Page() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [clientSecret, setClientSecret] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const connectToStripe = useCallback(async () => {
    try {
      const tier = getSearchParams()?.get("tier") || "";
      const response = await fetch("/api/payment/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              name: `Support ${getTier(tier)}`,
              price: getTier(tier) * 100, // ex. 5 * 100 = 5$
            },
          ],
          tier: getTier(tier),
        }),
      });

      if (!response.ok) {
        alert("Something went wrong...");
        console.error(`HTTP error! status: ${response.status}`);
        return;
      }
      const data = await response.json();
      setClientSecret(data?.clientSecret || "");
    } catch (error) {
      alert("Something went wrong...");
      console.error("Error connect to Stripe:", error);
    }
  }, []);

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    connectToStripe();
  }, [connectToStripe, router]);

  useEffect(() => {
    setConfirmed(
      getSearchParams()?.get("payment_intent_client_secret") !== null
    );
  }, [clientSecret, setConfirmed]);

  const appearance: Appearance = {
    theme: "stripe",
  };
  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };

  return (
    <div className='flex justify-center items-center min-h-[100vh]'>
      <div className='my-10'>
        <>
          {!isLoaded || !clientSecret ? (
            <p className='text-center'>Loading...</p>
          ) : (
            <>
              {!user ? (
                <p className='text-center'>Sign in or register, please...</p>
              ) : (
                <>
                  <Elements options={options} stripe={stripePromise}>
                    {confirmed ? (
                      <CompletePage
                        // make sure that tier is a valid number
                        tier={getTier(getSearchParams()?.get("tier") || "")}
                        userClerkId={user.id}
                        userEmail={user.emailAddresses[0].emailAddress}
                      />
                    ) : (
                      <CheckoutForm
                        tier={getSearchParams()?.get("tier") || ""}
                      />
                    )}
                  </Elements>
                </>
              )}
            </>
          )}
        </>
      </div>
    </div>
  );
}
