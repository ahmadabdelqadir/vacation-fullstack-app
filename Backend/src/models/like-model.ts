import { Document, model, Schema, Types } from "mongoose";

export interface ILikeDocument extends Document {
    _id: any;
    userId: Types.ObjectId;
    vacationId: Types.ObjectId;
    createdAt: Date;
}

const likeSchema = new Schema<ILikeDocument>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        vacationId: { type: Schema.Types.ObjectId, ref: "Vacation", required: true }
    },
    { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

// Compound unique index prevents duplicate likes at the database level.
likeSchema.index({ userId: 1, vacationId: 1 }, { unique: true });

export const LikeModel = model<ILikeDocument>("Like", likeSchema);
