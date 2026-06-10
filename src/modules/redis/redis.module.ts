import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';
import { RedisService } from './redis.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: RedisService,
      useFactory: (configService: ConfigService) => {
        return new RedisService(
          new Redis({
            url: configService.get('REDIS_URL'),
            token: configService.get('REDIS_TOKEN'),
          }),
        );
      },
      inject: [ConfigService],
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
