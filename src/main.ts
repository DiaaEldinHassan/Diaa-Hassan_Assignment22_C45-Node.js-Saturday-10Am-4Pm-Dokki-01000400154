import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.listen(env.port!, () => {
    console.log(`Server is Running On Port ${env.port} 🚀🚀🚀`);
  });
}
bootstrap();
