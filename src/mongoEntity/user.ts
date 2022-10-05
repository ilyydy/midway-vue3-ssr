import { prop, modelOptions } from '@typegoose/typegoose';
import * as mongoose from 'mongoose';

@modelOptions({
  schemaOptions: {
    // toJSON: { getters: true },
    // toObject: { virtuals: true },
    timestamps: true,
  },
})
export class User {
  // @prop({ default: () => new mongoose.Types.ObjectId() })
  // public _id: mongoose.Types.ObjectId;

  @prop()
  public name?: string;

  @prop({ type: () => [String] })
  public jobs?: string[];

  public get fullName() {
    return this.name?.toUpperCase();
  }
}
