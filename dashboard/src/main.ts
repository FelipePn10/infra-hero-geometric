import { NestFactory } from "@nestjs/core";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import * as compression from "compression";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug", "verbose"],
  });

  // ========================================
  // Security
  // ========================================
  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  });

  // ========================================
  // Compression
  // ========================================
  app.use(compression());

  // ========================================
  // Validation
  // ========================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ========================================
  // Global Filters & Interceptors
  // ========================================
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(),
  );

  // ========================================
  // API Versioning
  // ========================================
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  // ========================================
  // Swagger Documentation
  // ========================================
  const config = new DocumentBuilder()
    .setTitle("Hero Infra API")
    .setDescription("Modern Docker infrastructure management API")
    .setVersion("2.1.0")
    .addTag("services", "Service management endpoints")
    .addTag("monitoring", "Monitoring and metrics")
    .addTag("backups", "Backup and snapshot management")
    .addTag("ai", "AI Assistant endpoints")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  // ========================================
  // Start Server
  // ========================================
  const port = process.env.PORT || 5000;
  await app.listen(port);

  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🚀 Hero Infra API v2.1                              ║
║                                                        ║
║   Server:    http://localhost:${port}                 ║
║   API Docs:  http://localhost:${port}/api/docs        ║
║   Health:    http://localhost:${port}/health          ║
║                                                        ║
║   Environment: ${process.env.NODE_ENV || "development"}           ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
