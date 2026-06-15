import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { UserDBService, ProductDBService, ReviewDBService } from '../../common/service/db.service';
import { AuthGuard } from '../../guards/auth.guard';
import { TokenService } from '../../common/service/token.service';
import { RedisModule } from '../redis/redis.module';
import { User, UserSchema } from '../../db/models/user.model';
import { Product, ProductSchema } from '../../db/models/products.model';
import { Review, ReviewSchema } from '../../db/models/reviews.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Users', schema: UserSchema },
      { name: 'Products', schema: ProductSchema },
      { name: 'Reviews', schema: ReviewSchema },
    ]),
    RedisModule,
  ],
  controllers: [AdminController],
  providers: [
    UserDBService,
    ProductDBService,
    ReviewDBService,
    AuthGuard,
    TokenService,
  ],
})
export class AdminModule {}
