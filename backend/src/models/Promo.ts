import mongoose, { Schema, Document } from 'mongoose';

export interface IPromo extends Document {
    code: string;           // GRAND10, SUMMER20
    discountType: 'percent' | 'fixed'; // 10% yoki 15000 so'm
    discountValue: number;  // 10 yoki 15000
    minOrderAmount: number; // Minimal buyurtma summasi
    maxUses: number;        // Max necha marta ishlatish mumkin
    usedCount: number;      // Hozir necha marta ishlatildi
    isActive: boolean;
    expiresAt?: Date;
}

const PromoSchema: Schema = new Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { type: String, enum: ['percent', 'fixed'], required: true },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxUses: { type: Number, default: 999 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
}, { timestamps: true });

export default mongoose.model<IPromo>('Promo', PromoSchema);
