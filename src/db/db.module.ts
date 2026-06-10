import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './models/user.model';
import {  ProductSchema } from './models/products.model';
import {  CartSchema } from './models/cart.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Users', schema: UserSchema },
      { name: 'Products', schema: ProductSchema },
      { name: 'Carts', schema: CartSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
