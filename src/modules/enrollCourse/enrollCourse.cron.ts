import cron from "node-cron";
import Stripe from "stripe";
import EnrollCourse from "./enrollCourse.model";
import Course from "../course/course.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Run every 10 seconds
cron.schedule("*/10 * * * * *", async () => {
  try {
    const pendingEnrollments = await EnrollCourse.find({ paymentStatus: "pending" });

    for (const enrollment of pendingEnrollments) {
      if (!enrollment.transactionId) continue;

      try {
        const session = await stripe.checkout.sessions.retrieve(enrollment.transactionId);

        if (session.payment_status === "paid") {
          enrollment.paymentStatus = "paid";
          await enrollment.save();

          await Course.findByIdAndUpdate(enrollment.courseId, {
            $inc: { totalEnrolled: 1 },
          });

          console.log(`[Cron] Enrollment ${enrollment._id} verified as paid.`);
        } else if (session.status === "expired") {
          enrollment.paymentStatus = "failed";
          await enrollment.save();
          console.log(`[Cron] Enrollment ${enrollment._id} marked as failed (expired checkout).`);
        }
      } catch (err) {
        console.error(`[Cron] Error checking Stripe session ${enrollment.transactionId}:`, err);
      }
    }
  } catch (error) {
    console.error("[Cron] Error fetching pending enrollments:", error);
  }
});

console.log("Enrollment cron job initialized.");
