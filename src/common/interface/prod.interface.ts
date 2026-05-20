import { Types } from 'mongoose';

export interface IProd {
  name: string;
  description: string;
  price: number;
  seller: Types.ObjectId;
  stock: number;
  category: string;
}
