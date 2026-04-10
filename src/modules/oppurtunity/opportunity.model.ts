import { model, Schema } from "mongoose";
import { IOpportunity } from "./opportunity.interface";


const opportunitySchema = new Schema<IOpportunity>(
    {
        title: { type: String, required: true },
        organizationName: { type: String, required: true },
        opportunityType: { type: String, required: true },
        location: { type: String, required: true },
        officialLink: { type: String, required: true },
        shortDescription: { type: String, required: true, maxlength: 300 },
        submittedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
        status: {
            type: String,
            enum: ["pending", "reviewed", "rejected"],
            default: "pending",
        },
    },
    { timestamps: true, versionKey: false }
);

const Opportunity = model<IOpportunity>("Opportunity", opportunitySchema);
export default Opportunity;