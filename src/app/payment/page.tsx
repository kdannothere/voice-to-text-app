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
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

// avoid recreating the Stripe object on every render.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

function getPrice(value: string): number {
  const price = Number(value);
  if (price > 0) {
    return price;
  }
  return 5;
}

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tier, setTier] = useState(searchParams.get("tier") || "");
  const { user, isLoaded } = useUser();
  const [clientSecret, setClientSecret] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const connectToStripe = useCallback(async () => {
    try {
      const response = await fetch("/api/payment/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              name: `Support ${getPrice(tier)}`,
              price: getPrice(tier) * 100,
            },
          ],
        }),
      });

      if (!response.ok) {
        alert("Something went wrong...");
        console.error(`HTTP error! status: ${response.status}`);
        return;
      }
      const _clientSecret = (await response.json()).clientSecret;
      setClientSecret(_clientSecret);
    } catch (error) {
      alert("Something went wrong...");
      console.error("Error connect to Stripe:", error);
    }
  }, [tier]);

  useEffect(() => {
    // go to main page because user didn't choose a tier
  if (!tier) {
    alert("Choose how much you want to pay, please.");
    router.push("/");
    return;
  }
    // Create PaymentIntent as soon as the page loads
    connectToStripe();
  }, [connectToStripe, router, tier]);

  useEffect(() => {
    setConfirmed(searchParams.get("payment_intent_client_secret") !== null);
  }, [clientSecret, setConfirmed, searchParams]);

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
                        tier={tier}
                        userClerkId={user.id}
                        userEmail={user.emailAddresses[0].emailAddress}
                      />
                    ) : (
                      <CheckoutForm tier={tier} />
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