import { Document } from 'mongoose';

export interface INewsletter extends Document {
  email: string;
  isSynced: boolean;
  subscriptionSource: string;
  createdAt: Date;
  updatedAt: Date;
}