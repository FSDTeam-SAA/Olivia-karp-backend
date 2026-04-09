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

  // Verify if already enrolled
  const existingEnrollment = await EnrollCourse.findOne({
    userId: user._id,
    courseId: course._id,
    paymentStatus: "completed",
  });

  if (existingEnrollment) {
    throw new Error("You are already enrolled in this course.");
  }

  const price = course.price || 0;

  if (price <= 0) {
    throw new Error("Course price must be greater than 0 to generate a Stripe checkout URL.");
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
    success_url: `${process.env.FRONT_END_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
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

const getMyEnrollments = async (userId: string) => {
  // Optimized: Directly filter by userId from token
  const enrollments = await EnrollCourse.find({
    userId,
    paymentStatus: "completed",
  })
  .populate("courseId")
  .sort({ createdAt: -1 });

  return enrollments;
};

const enrollCourseService = {
  createEnrollCourse,
  getMyEnrollments,
};

export default enrollCourseService;
