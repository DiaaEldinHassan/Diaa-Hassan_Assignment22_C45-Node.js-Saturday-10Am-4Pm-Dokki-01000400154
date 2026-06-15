import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SellerController } from './seller.controller';
import { S3Service } from '../../common/service/s3.service';
import { ProductDBService } from '../../common/service/db.service';
import { TokenService } from '../../common/service/token.service';
import { AuthGuard } from '../../guards/auth.guard';
import { RedisModule } from '../redis/redis.module';
import { Product, ProductSchema } from '../../db/models/products.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Products', schema: ProductSchema }]),
    RedisModule,
  ],
  controllers: [SellerController],
  providers: [
    S3Service,
    ProductDBService,
    TokenService,
    AuthGuard,
  ],
})
export class SellerModule {}
