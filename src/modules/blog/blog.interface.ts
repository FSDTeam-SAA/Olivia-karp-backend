import { Document } from "mongoose";

export type TBlogCategory =
  | "Expert Insights"
  | "Climate Careers"
  | "Research"
  | "Toolkit"
  | "Renewable Energy";

export interface IBlogAuthor {
  name: string;
  description: string;
  profileImage: {
    url: string;
    public_id: string;
  };
}

export interface IBlog extends Document {
  title: string;
  category: TBlogCategory;
  thumbnailImage: {
    url: string;
    public_id: string;
  };
  content: string; // This will store the Rich Text/HTML from the editor
  author: IBlogAuthor;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}


