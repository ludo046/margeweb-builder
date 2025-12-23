import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('JWT_ACCESS_SECRET loaded?', !!process.env.JWT_ACCESS_SECRET);
console.log('JWT_ACCESS_SECRET length', (process.env.JWT_ACCESS_SECRET || '').length);


  app.use(helmet());
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

app.enableCors({
  origin: ['http://localhost:4200'],
  credentials: true,
});



  await app.listen(process.env.PORT || 3001);
}
bootstrap();
