import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
}

const BranchSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IBranch>('Branch', BranchSchema);
