import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: env.client_url,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.listen(env.port!, () => {
    console.log(`Server is Running On Port ${env.port} 🚀🚀🚀`);
  });
}
bootstrap();
