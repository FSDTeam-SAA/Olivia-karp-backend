import { model, Schema } from "mongoose";
import { ITeam, ISocialLink } from "./team.interface";

const SocialLinkSchema = new Schema<ISocialLink>({
  platform: { type: String, required: true },
  url: { type: String, required: true },
}, { _id: false }); // Skip subdocument ID

const TeamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true },
    designation: { type: String, required: true },
    description: { type: String, required: true },
    profilePicture: {
      url: { type: String },
      public_id: { type: String },
    },
    socialLinks: { type: [SocialLinkSchema], default: [] },
  },
  { timestamps: true, versionKey: false },
);

const Team = model<ITeam>("Team", TeamSchema);
export default Team;
