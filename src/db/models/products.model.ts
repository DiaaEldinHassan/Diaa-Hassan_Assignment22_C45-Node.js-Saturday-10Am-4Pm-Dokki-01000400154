import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ECategory } from '../../common';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ collection: 'Products', optimisticConcurrency: true, timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, enum: ECategory, trim: true })
  category: string;

  @Prop({ required: true })
  stock: number;

  @Prop([String])
  images?: string[];

  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  seller: Types.ObjectId;

  @Prop({ default: false })
  approved?: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
