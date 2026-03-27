

export interface ISurvey {
    name: string;
    email: string;
    topic: string;
    industry: string;
    professionalBackground: string;
    focus: string;
    preferredQuestions: string[];
    date: Date;
    time: string;
    status: "pending" | "approved" | "rejected";
}