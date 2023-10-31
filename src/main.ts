import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import morgan from 'morgan';

// const DEFAULT_API_VERSION = '1';
const PORT = process.env.PORT || '3000';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigin = process.env.CORS_ORIGIN.split(',') || [
    'http://localhost:3000',
  ];

  app.enableCors({
    // allowedHeaders: ['content-type'],
    // origin: corsOrigin,
    // credentials: true,
  });

  app.use(morgan('tiny'));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // app.useStaticAssets(join(__dirname, '.', 'public'));
  // app.setBaseViewsDir(join(__dirname, '.', 'views'));
  // app.setViewEngine('pub');
  if (process.env.APP_ENV !== 'production') {
    const options = new DocumentBuilder()
      .setTitle('API docs')
      // .setVersion(DEFAULT_API_VERSION)
      .addBearerAuth()
      .build();

    // const globalPrefix = 'docs';
    // app.setGlobalPrefix(globalPrefix);
    // app.enableVersioning({
    //   defaultVersion: DEFAULT_API_VERSION,
    //   type: VersioningType.URI,
    // });

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('docs', app, document);
  }
  await app.listen(PORT);
  Logger.log(`🚀 Application is running in port ${PORT}`);
}
bootstrap();
