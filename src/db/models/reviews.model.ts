import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ collection: 'Reviews', optimisticConcurrency: true, timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, minlength: 2 })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Products', required: true })
  productId: Types.ObjectId;

  @Prop({ default: 0 })
  rating: number;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

@Schema({ collection: 'Reviews', optimisticConcurrency: true, timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, required: true })
  productId: Types.ObjectId;

  @Prop({ type: [CommentSchema], default: [] })
  reviews?: Comment[];
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
