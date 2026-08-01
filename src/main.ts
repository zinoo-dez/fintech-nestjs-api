import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Set global API prefix
  app.setGlobalPrefix('api/v1');

  // Enable CORS for React.js, Vue, Mobile apps, etc.
  app.enableCors();

  // Enable automatic DTO validation across all endpoints
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unhandled properties
      transform: true, // Automatically transform payloads to DTO instances
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Api running on: http://localhost:${port}/api/v1`);
}
bootstrap();

