    export interface Plan {
  _id: string;
  title: string;
  description: string;
  price: number;
  interval: "month" | "year";
  mightyRedirectUrl: string; // The MN Share Link
  features: string[];
  isPopular: boolean;
  createdAt: Date;
  updatedAt: Date;
}