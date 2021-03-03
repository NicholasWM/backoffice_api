import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from "dotenv";
import * as bodyParser from 'body-parser'

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger:['verbose', 'error', 'log', 'warn']
  });
  const options = new DocumentBuilder()
    .setTitle('PP BackOffice API')
    .setDescription('API Routes')
    .addBearerAuth()
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  app.use(bodyParser.json({limit:'50mb'}))
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
  app.enableCors();
  
  await app.listen(3000);
}
bootstrap();
