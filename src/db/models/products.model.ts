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

  @Prop({ required: true, trim: true })
  brand: string;

  @Prop({ required: true })
  stock: number;

  @Prop([String])
  images?: string[];

  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  seller: Types.ObjectId;

  @Prop({ default: false })
  approved?: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Date })
  retrievedAt?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

const excludeDeleted = function (this: any) {
  const query = this.getQuery();

  if (!query?.includeDeleted) {
    this.where({
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    });
  } else {
    delete query.includeDeleted;
  }
};

ProductSchema.pre(/^find/, excludeDeleted);
ProductSchema.pre('findOne', excludeDeleted);
ProductSchema.pre('findOneAndUpdate', excludeDeleted);
