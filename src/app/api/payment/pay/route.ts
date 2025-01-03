import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const calculateOrderAmount = (items: any) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  if (items && items.length) {
    return items[0].price;
  }
  return 500;
};

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const items = data.items;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(items),
      currency: "eur",
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
    });
    const clientSecret = paymentIntent.client_secret;
    return new NextResponse(
      JSON.stringify({
        clientSecret: clientSecret,
      })
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Payment error:", error.message);
    return new NextResponse(
      JSON.stringify({
        clientSecret: null,
      })
    );
  }
}
