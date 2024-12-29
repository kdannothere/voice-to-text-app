import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  if (items && items.length) {
    return items[0].price;
  }
  return 500;
};

export async function POST(req: Request) {
  let clientSecret = null;

  try {
    const items = (await req.json()).items;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(items),
      currency: "eur",
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
    });
    clientSecret = paymentIntent.client_secret;
    return new NextResponse(
      JSON.stringify({
        clientSecret: clientSecret,
      })
    );
  } catch (error: any) {
    console.error("Payment error:", error.message);
  } finally {
    return new NextResponse(
      JSON.stringify({
        clientSecret: clientSecret,
      })
    );
  }
}
