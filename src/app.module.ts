import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageModule } from './modules/message.module';
import { ClientModule } from './modules/clients.module';
import { TemplateMessageService } from './Services/Message/templateMessage.service';

@Module({
  imports: [MessageModule, ClientModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
