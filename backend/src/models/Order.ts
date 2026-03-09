import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  customerName?: string;
  customerPhone?: string;
  orderType: 'delivery' | 'takeaway' | 'dine-in';
  tableNumber?: string;
  branchName?: string;
  deliveryAddress?: string;
  items: {
    productId: string;
    productName?: string; // Menyudagi nomi to'g'ridan to'g'ri olinadi
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'delivering' | 'completed' | 'cancelled';
  telegramChatId?: string; // mijozning telegram ID si
}

const OrderSchema: Schema = new Schema({
  customerName: { type: String, default: 'Mijoz' },
  customerPhone: { type: String },
  orderType: { type: String, enum: ['delivery', 'takeaway', 'dine-in'], required: true },
  tableNumber: { type: String },
  branchName: { type: String },
  deliveryAddress: { type: String },
  items: [{
    productId: { type: String, required: true },
    productName: { type: String }, // Mijoz ko'rishi uchun qulay format
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'preparing', 'delivering', 'completed', 'cancelled'], default: 'pending' },
  telegramChatId: { type: String }
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);
