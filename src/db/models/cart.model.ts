import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CartDocument = HydratedDocument<Cart>;

@Schema({ collection: 'Carts', optimisticConcurrency: true, timestamps: true })
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Products', required: true })
  product: Types.ObjectId;

  @Prop({ required: true, min: 1, default: 1 })
  quantity: number;

  @Prop({ required: true })
  price: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ collection: 'Carts', optimisticConcurrency: true, timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, ref: 'Users', required: true, unique: true })
  user: Types.ObjectId;

  @Prop({ type: [CartItemSchema], default: [] })
  products?: CartItem[];

  @Prop({ default: 0 })
  totalPrice?: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
