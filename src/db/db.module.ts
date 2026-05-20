import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/user.model';
import { Product, ProductSchema } from './models/products.model';
import { Cart, CartSchema } from './models/cart.model';

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
