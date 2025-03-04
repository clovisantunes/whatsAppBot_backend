import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: 'http://localhost:3001', // Permite requisições do frontend React
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
    credentials: true, // Permite o envio de credenciais (cookies, headers de autenticação)
  });
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
