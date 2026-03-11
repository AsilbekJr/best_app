import mongoose, { Schema, Document } from 'mongoose';

export interface IRating extends Document {
    telegramUserId: string;
    userName: string;
    stars: number;
    createdAt: Date;
}

const RatingSchema: Schema = new Schema({
    telegramUserId: { type: String, required: true },
    userName: { type: String, default: 'Noma\'lum' },
    stars: { type: Number, required: true, min: 1, max: 5 },
}, { timestamps: true });

export default mongoose.model<IRating>('Rating', RatingSchema);
