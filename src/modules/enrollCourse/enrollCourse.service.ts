import Stripe from "stripe";
import Course from "../course/course.model";
import { User } from "../user/user.model";
import { IEnrollCourse } from "./enrollCourse.interface";
import EnrollCourse from "./enrollCourse.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const createEnrollCourse = async (payload: IEnrollCourse, email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("No account found with the provided credentials.");
  }

  const course = await Course.findById(payload.courseId);
  if (!course) {
    throw new Error("Course not found.");
  }

  const price = course.price || 0;

  if (price === 0) {
    const result = await EnrollCourse.create({
      userId: user._id,
      courseId: course._id,
      paymentStatus: "paid",
    });

    await Course.findByIdAndUpdate(payload.courseId, {
      $inc: { totalEnrolled: 1 },
    });

    return { result, checkoutUrl: null };
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: course.currency || "cad",
          product_data: { name: course.title },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: user._id.toString(),
      courseId: course._id.toString(),
      isCourseEnrollment: "true",
    },
    success_url: `${process.env.FRONT_END_URL}/payment/success`,
    cancel_url: `${process.env.FRONT_END_URL}/payment/cancel`,
  });

  const result = await EnrollCourse.create({
    userId: user._id,
    courseId: course._id,
    transactionId: session.id,
    paymentStatus: "pending",
  });

  return { result, checkoutUrl: session.url };
};

const enrollCourseService = {
  createEnrollCourse,
};

export default enrollCourseService;
