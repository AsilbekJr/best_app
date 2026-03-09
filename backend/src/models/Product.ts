import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: mongoose.Types.ObjectId;
  isActive: boolean;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String }, // URL to image
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', ProductSchema);
