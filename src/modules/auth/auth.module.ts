import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService, UserDBService, MailModule } from '../../common';
import { AuthGuard } from '../../guards/auth.guard';
import { User, UserSchema } from '../../db/models/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Users', schema: UserSchema }]),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, AuthGuard, UserDBService],
  exports: [],
})
export class AuthModule {}
