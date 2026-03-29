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
  //  Check User
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(
      "No account found with the provided credentials.",
      StatusCodes.NOT_FOUND,
    );
  }

  // Check Subscription Plan
  const subscription = await SubscriptionPlan.findById(subscriptionPlanId);
  if (!subscription) {
    throw new AppError("Subscription not found", StatusCodes.NOT_FOUND);
  }

  const now = new Date();

  // Free Trial
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

  // Paid Plan → Create Stripe Checkout Session
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

  //  Verify Stripe Signature
  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    throw new AppError(
      `Webhook Error: ${err.message}`,
      StatusCodes.BAD_REQUEST,
    );
  }

  //  Handle Event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const subscriptionId = session.metadata?.subscriptionId;

    if (!userId || !subscriptionId) {
      throw new AppError("Missing metadata", StatusCodes.BAD_REQUEST);
    }

    const userObjectId = new Types.ObjectId(userId);
    const subscriptionObjectId = new Types.ObjectId(subscriptionId);

    // Get Subscription Plan
    const subscription = await SubscriptionPlan.findById(subscriptionObjectId);
    if (!subscription) {
      throw new AppError("Subscription not found", StatusCodes.NOT_FOUND);
    }

    // Calculate Expiration Date
    const now = new Date();
    let expirationDate = new Date(now);

    if (subscription.billingType === "monthly") {
      expirationDate.setMonth(expirationDate.getMonth() + 1);
    } else if (subscription.billingType === "yearly") {
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    }

    // Prevent Duplicate Entry (VERY IMPORTANT)
    const existingPayment = await Payment.findOne({
      transactionId: session.id,
    });

    if (existingPayment) {
      return { message: "Payment already processed" };
    }

    // Create Payment
    const payment = await Payment.create({
      userId: userObjectId,
      subscriptionPlan: subscriptionObjectId,
      transactionId: session.id,
      status: "paid",
      amount: subscription.price,
    });

    // Create Subscription (Option 2: New Document)
    const purchase = await PurchaseSubscription.create({
      userId: userObjectId,
      subscriptionId: subscriptionObjectId,
      paymentId: payment._id,
      purchaseDate: now,
      expirationDate,
    });

    return purchase;
  }

  return { message: `Unhandled event type: ${event.type}` };
};

const getAllPayment = async (query: any) => {
  // ✅ 1️⃣ Pagination params
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  // ✅ 2️⃣ Filter (optional)
  const filter: any = {};

  if (query.userId) {
    filter.userId = query.userId;
  }

  if (query.status) {
    filter.status = query.status;
  }

  // ✅ 3️⃣ Search (optional transactionId)
  if (query.search) {
    filter.transactionId = {
      $regex: query.search,
      $options: "i",
    };
  }

  // ✅ 4️⃣ Query execution
  const payments = await Payment.find(filter)
    .populate({
      path: "userId",
      select: "firstName lastName email image",
    })
    .populate({
      path: "subscriptionPlan",
      select: "title description price",
    })
    .sort({ createdAt: -1 }) // latest first
    .skip(skip)
    .limit(limit);

  // ✅ 5️⃣ Total count
  const total = await Payment.countDocuments(filter);

  // ✅ 6️⃣ Meta return
  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: payments,
  };
};

const getSinglePayment = async (id: string) => {
  const payment = await Payment.findById(id)
    .populate({
      path: "userId",
      select: "firstName lastName email image",
    })
    .populate({
      path: "subscriptionPlan",
      select: "title description price",
    });
  if (!payment) {
    throw new AppError("Payment not found", StatusCodes.NOT_FOUND);
  }
  return payment;
};

const getMyPayment = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }
  const payments = await Payment.find({ userId: user._id })
    .populate({
      path: "userId",
      select: "firstName lastName email image",
    })
    .populate({
      path: "subscriptionPlan",
      select: "title description price",
    });
  return payments;
};

const paymentService = {
  createPaymentForSubscription,
  stripeWebhookHandler,
  getAllPayment,
  getSinglePayment,
  getMyPayment,
};

export default paymentService;
