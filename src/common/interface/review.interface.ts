import { Types } from 'mongoose';

export interface IReview {
  productId: Types.ObjectId;
  reviews?: IComment[];
}

export interface IComment {
  userId: Types.ObjectId;
  content: string;
  productId: Types.ObjectId;
  rating: number;
}
