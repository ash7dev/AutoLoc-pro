import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './shared/filters/http-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());

  // Capture the raw body before parsing — required for webhook HMAC verification (@RawBody()).
  // Must be registered here, before body-parser, so the verify callback runs first.
  const captureRawBody = (req: any, _res: any, buf: Buffer) => { req.rawBody = buf; };
  const { json, urlencoded } = require('body-parser');
  app.use(json({ limit: '50mb', verify: captureRawBody }));
  app.use(urlencoded({ limit: '50mb', extended: true, verify: captureRawBody }));
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8081',
    'http://localhost:19006',
    'https://www.autoloc.sn',
    'https://autoloc.sn',
  ];
  app.enableCors({
    origin: (origin, callback) => {
      // 1. Mobile Native Apps (iOS/Android) don't send an Origin header
      // 2. Local/Staging/Production web origins
      // 3. In non-production, accept requests from local network IPs (e.g. Expo Go 192.168.x.x)
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV !== 'production'
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
}

bootstrap();
