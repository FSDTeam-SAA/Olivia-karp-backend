import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import { Plan } from "./mighty.model";
import sendEmail from "../../utils/sendEmail";
import { welcomeEmailTemplate } from "../../utils/welcomeEmailTemplate";
import config from "../../config";

const activateMightyMembership = async (payload: { email: string; mightyId: string }) => {
  const { email, mightyId } = payload;
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Find user by email
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    // Logic: Log warning if user exists in MN but not in our DB
    console.warn(`[MightySync] User ${normalizedEmail} paid on MN but has no account on our custom site.`);
    throw new AppError("Local user account not found. Please register first.", StatusCodes.NOT_FOUND);
  }

  // Check if they were already a member
  const wasAlreadyMember = user.role === "member";

  // 2. Perform the "Flip": non-member -> member
  const updatedUser = await User.findOneAndUpdate(
    { email: normalizedEmail },
    {
      $set: {
        role: "member", // Updates the enum role
        mightyMemberId: mightyId,
        memberSince: user.memberSince || new Date(), // Keep original date if already set
      },
    },
    { new: true }
  );

  // 3. Send automated welcome email if they just became a member
  if (!wasAlreadyMember && updatedUser) {
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "Success! You are now a member",
        html: welcomeEmailTemplate(
          updatedUser.firstName || "Member",
          config.mighty.mighty_community_url || "https://act-on-climate-community.mn.co"
        ),
      });
      console.log(`[MightySync] Welcome email sent to ${normalizedEmail}`);
    } catch (error) {
      console.error(`[MightySync] Failed to send welcome email to ${normalizedEmail}:`, error);
      // We don't throw here to avoid failing the whole webhook process
    }
  }

  return updatedUser;
};


const getAllPlansFromDB = async () => {
  return await Plan.find();
};

export const mightyService = {
  activateMightyMembership,
  getAllPlansFromDB
};