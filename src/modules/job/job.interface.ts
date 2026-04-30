import { Types } from "mongoose";

export interface IJob {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  category: string;
  jobType: "full-time" | "part-time" | "internship" | "contract";
  location: string;
  description: string;
  responsibility: string;
  requirement: string;
  skill: string;
  companyName: string;
  companyURL: string;
  companyLogo: {
    url: string;
    public_id: string;
  };
  media: {
    images: [
      {
        url: string;
        public_id: string;
      },
    ];
    videos: [
      {
        url: string;
        public_id: string;
      },
    ];
  };
  deathLine: Date;
  postedDate: Date;
  hiredCount?: number;
  totalHiredCount?: number;
  status: "open" | "closed" | "filled";
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: "hour" | "day" | "month" | "year";
  };
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
