import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import { Plan } from "./mighty.model";
import sendEmail from "../../utils/sendEmail";
import { welcomeEmailTemplate } from "../../utils/welcomeEmailTemplate";
import config from "../../config";

const activateMightyMembership = async (payload: { email: string; mightyId: string; name?: string }) => {
  const { email, mightyId, name } = payload;
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Find user by email
  const user = await User.findOne({ email: normalizedEmail });

  let updatedUser;
  let wasAlreadyMember = false;

  if (!user) {
    // User paid on Mighty Networks before registering on the custom site!
    // Auto-provision a pre-activated member account
    const randomPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8) +
      "!A1";

    let firstName = "Member";
    let lastName = "Member";
    if (name && typeof name === "string" && name.trim()) {
      const parts = name.trim().split(" ");
      firstName = parts[0] || "Member";
      lastName = parts.slice(1).join(" ") || "Member";
    } else {
      const emailPrefix = normalizedEmail.split("@")[0];
      firstName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    }

    updatedUser = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      password: randomPassword,
      role: "member",
      isVerified: true,
      isSurvey: false,
      hasSeenOnboardingModal: false,
      mightyMemberId: mightyId,
      memberSince: new Date(),
    });
    console.log(`[MightySync] Auto-provisioned new member account for ${normalizedEmail}`);
  } else {
    wasAlreadyMember = user.role === "member";

    // 2. Perform the "Flip": non-member -> member
    updatedUser = await User.findOneAndUpdate(
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
  }

  // 3. Send automated welcome email if they just became a member
  if ((!wasAlreadyMember || !user) && updatedUser) {
    try {
      const dashboardUrl = config.frontendUrl
        ? `${config.frontendUrl.replace(/\/$/, "")}/dashboard`
        : "https://actonclimate.net/dashboard";

      await sendEmail({
        to: normalizedEmail,
        subject: "Success! You are now a member",
        html: welcomeEmailTemplate(
          updatedUser.firstName || "Member",
          config.mighty.mighty_community_url || "https://act-on-climate-community.mn.co",
          dashboardUrl
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