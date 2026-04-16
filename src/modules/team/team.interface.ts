import { Document } from "mongoose";

export interface ISocialLink {
  platform: string;
  url: string;
}

export interface ITeam extends Document {
  name: string;
  designation: string;
  description: string;
  profilePicture?: {
    url: string;
    public_id: string;
  };
  socialLinks: ISocialLink[];
}
