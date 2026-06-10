import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../db/models/user.model';
import { TokenService, UserDBService } from '../../common';
import { S3Service } from '../../common/service/s3.service';
import { AuthGuard } from '../../guards/auth.guard';
import { RedisModule } from '../redis/redis.module';
import { UsersController } from './users.controller';
import { UserService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Users', schema: UserSchema }]),
    RedisModule,
  ],
  controllers: [UsersController],
  providers: [UserService, UserDBService, TokenService, AuthGuard, S3Service],
})
export class UsersModule {}
