import { model, Schema } from "mongoose";
import { ISurvey } from "./survey.interface";

const SurveySchema = new Schema<ISurvey>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    link: { type: String },
    climateJourney: { type: String, required: true },
    message: { type: String, required: true },
    interest: { type: [String], required: true },
    goals: { type: [String], required: true },
    successMessage: { type: String, required: true },
    whatLooking: { type: [String], required: true },
    engagementPreference: { type: String, required: true },
    opportunity: { type: String, required: true },
    hubs: { type: String, required: true },
    region: { type: String, required: true },
    impactNewsletter: { type: Boolean, default: false },
    localNotification: { type: Boolean, default: false },
    updateFrequency: { type: String, required: true },
    tellAbout: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

const Survey = model<ISurvey>("Survey", SurveySchema);
export default Survey;
