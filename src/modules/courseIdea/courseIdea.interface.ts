import { Schema } from "mongoose";

export type TSkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface ICourseIdea {
    title: string;
    category: string;
    skillLevel: TSkillLevel;
    description: string;
    keyTopics: string[];
    whoIsThisCourseFor: string;
    yourName: string;
    yourEmail: string;
    isCollabInterested: boolean;
    submittedBy: Schema.Types.ObjectId; // Linked to User Model
    status: 'Pending' | 'Reviewed' | 'Approved' | 'Rejected';
    createdAt: Date;
}