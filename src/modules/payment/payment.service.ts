/* eslint-disable prefer-const */
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import Stripe from "stripe";
import AppError from "../../errors/AppError";
import PurchaseSubscription from "../purchaseSubscription/purchaseSubscription.model";
import SubscriptionPlan from "../subscriptionPlan/subscriptionPlan.model";
import { User } from "../user/user.model";
import Payment from "./payment.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const createPaymentForSubscription = async (
  subscriptionPlanId: string,
  email: string,
) => {
  // 1️⃣ Check User
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(
      "No account found with the provided credentials.",
      StatusCodes.NOT_FOUND,
    );
  }

  // 2️⃣ Check Subscription Plan
  const subscription = await SubscriptionPlan.findById(subscriptionPlanId);
  if (!subscription) {
    throw new AppError("Subscription not found", StatusCodes.NOT_FOUND);
  }

  const now = new Date();

  // 3️⃣ Free Trial
  if (subscription.hasTrial) {
    const expirationDate = new Date(
      now.getTime() + (subscription.trialDays || 7) * 24 * 60 * 60 * 1000,
    );

    const newPurchase = await PurchaseSubscription.create({
      userId: user._id,
      subscriptionId: subscription._id,
      paymentId: null,
      purchaseDate: now,
      expirationDate,
    });

    return {
      subscription: newPurchase,
      message: "Free trial started",
    };
  }

  // 4️⃣ Paid Plan → Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: user.email,

    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: subscription.title,
            description: subscription.description,
          },
          unit_amount: subscription.price * 100, // cents
        },
        quantity: 1,
      },
    ],

    metadata: {
      userId: user._id.toString(),
      subscriptionId: subscription._id.toString(),
    },

    success_url: `${process.env.FRONT_END_URL}/payment/success`,
    cancel_url: `${process.env.FRONT_END_URL}/payment/cancel`,
  });

  return {
    checkoutUrl: session.url,
  };
};

const stripeWebhookHandler = async (sig: any, payload: Buffer) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  // ✅ 1️⃣ Verify Stripe Signature
  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    throw new AppError(
      `Webhook Error: ${err.message}`,
      StatusCodes.BAD_REQUEST,
    );
  }

  // ✅ 2️⃣ Handle Event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const subscriptionId = session.metadata?.subscriptionId;

    if (!userId || !subscriptionId) {
      throw new AppError("Missing metadata", StatusCodes.BAD_REQUEST);
    }

    const userObjectId = new Types.ObjectId(userId);
    const subscriptionObjectId = new Types.ObjectId(subscriptionId);

    // ✅ 3️⃣ Get Subscription Plan
    const subscription = await SubscriptionPlan.findById(subscriptionObjectId);
    if (!subscription) {
      throw new AppError("Subscription not found", StatusCodes.NOT_FOUND);
    }

    // ✅ 4️⃣ Calculate Expiration Date
    const now = new Date();
    let expirationDate = new Date(now);

    if (subscription.billingType === "monthly") {
      expirationDate.setMonth(expirationDate.getMonth() + 1);
    } else if (subscription.billingType === "yearly") {
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    }

    // ✅ 5️⃣ Prevent Duplicate Entry (VERY IMPORTANT)
    const existingPayment = await Payment.findOne({
      transactionId: session.id,
    });

    if (existingPayment) {
      return { message: "Payment already processed" };
    }

    // ✅ 6️⃣ Create Payment
    const payment = await Payment.create({
      userId: userObjectId,
      subscriptionPlan: subscriptionObjectId,
      transactionId: session.id,
      status: "paid",
      amount: subscription.price,
    });

    // ✅ 7️⃣ Create Subscription (Option 2: New Document)
    const purchase = await PurchaseSubscription.create({
      userId: userObjectId,
      subscriptionId: subscriptionObjectId,
      paymentId: payment._id,
      purchaseDate: now,
      expirationDate,
    });

    return purchase;
  }

  // অন্যান্য event ignore
  return { message: `Unhandled event type: ${event.type}` };
};

const paymentService = {
  createPaymentForSubscription,
  stripeWebhookHandler,
};

export default paymentService;
