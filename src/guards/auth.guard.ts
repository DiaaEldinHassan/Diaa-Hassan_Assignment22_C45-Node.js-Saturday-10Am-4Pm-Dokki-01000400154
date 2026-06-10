import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { TokenService } from '../common/service/token.service';
import { RedisService } from 'src/modules/redis/redis.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const [type, token] = authHeader?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid or missing token');
    }

    try {
      const isRevoked = await this.redis.get(token);
      if (isRevoked) {
        throw new BadRequestException('Token has been revoked');
      }

      const user = this.tokenService.verifyAccessToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      if (user.exp && user.exp < currentTime) {
        throw new UnauthorizedException('Token has expired');
      }
      request.user = user;
      await this.redis.set(`user:${user._id}`, user, 300);
      return true;
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      if (err.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
