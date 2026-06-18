import Stripe from "stripe";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import Course from "../course/course.model";
import { User } from "../user/user.model";
import { IEnrollCourse } from "./enrollCourse.interface";
import EnrollCourse from "./enrollCourse.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const COMPLETED_ENROLLMENT_STATUSES = ["completed", "free"];

const createEnrollCourse = async (payload: IEnrollCourse, email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(
      "No account found with the provided credentials.",
      httpStatus.UNAUTHORIZED,
    );
  }

  const course = await Course.findById(payload.courseId);
  if (!course) {
    throw new AppError("Course not found.", httpStatus.NOT_FOUND);
  }

  if (!course.isAvailable) {
    throw new AppError("Course is not available.", httpStatus.BAD_REQUEST);
  }

  // Verify if already enrolled
  const existingEnrollment = await EnrollCourse.findOne({
    userId: user._id,
    courseId: course._id,
    paymentStatus: { $in: COMPLETED_ENROLLMENT_STATUSES },
  });

  if (existingEnrollment) {
    throw new AppError(
      "You are already enrolled in this course.",
      httpStatus.CONFLICT,
    );
  }

  const pendingEnrollment = await EnrollCourse.findOne({
    userId: user._id,
    courseId: course._id,
    paymentStatus: "pending",
  });

  if (pendingEnrollment?.transactionId) {
    const session = await stripe.checkout.sessions.retrieve(pendingEnrollment.transactionId);

    if (session.url && session.status === "open") {
      return { result: pendingEnrollment, checkoutUrl: session.url };
    }
  }

  const price = course.price || 0;

  if (price <= 0) {
    const result = await EnrollCourse.create({
      userId: user._id,
      courseId: course._id,
      paymentStatus: "free",
    });

    await Course.findByIdAndUpdate(course._id, {
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
    paymentStatus: { $in: COMPLETED_ENROLLMENT_STATUSES },
  })
  .populate("courseId")
  .sort({ createdAt: -1 });

  return enrollments;
};

const verifyPaymentStatus = async (sessionId: string) => {
  // 1. Find the enrollment and populate course details for the response
  const enrollment = await EnrollCourse.findOne({ transactionId: sessionId }).populate("courseId");
  
  if (!enrollment) {
    throw new AppError(
      "Enrollment record not found for this session.",
      httpStatus.NOT_FOUND,
    );
  }

  // 2. If already marked as completed by Cron, return immediately
  if (enrollment.paymentStatus === "completed") {
    return enrollment;
  }

  // 3. Fetch current status from Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === "paid") {
    /**
     * ATOMIC UPDATE: We only update if status is still 'pending'.
     * This prevents the course 'totalEnrolled' count from incrementing twice 
     * if the Cron Job and this API hit at the same time.
     */
    const updatedEnrollment = await EnrollCourse.findOneAndUpdate(
      { transactionId: sessionId, paymentStatus: "pending" },
      { paymentStatus: "completed" },
      { new: true }
    ).populate("courseId");

    if (updatedEnrollment) {
      // Increment enrollment count on the Course
      await Course.findByIdAndUpdate(enrollment.courseId, { 
        $inc: { totalEnrolled: 1 } 
      });
      return updatedEnrollment;
    }
  } else if (session.status === "expired" || session.payment_status === "unpaid") {
    enrollment.paymentStatus = "failed";
    await enrollment.save();
  }

  return enrollment;
};

const enrollCourseService = {
  createEnrollCourse,
  getMyEnrollments,
  verifyPaymentStatus,
};

export default enrollCourseService;
