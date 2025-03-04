import { Module } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { WhatsAppGateway } from "src/config/WhatsApp.gateway";
import { MessageTemplateController } from "src/Controllers/Message/messageTemplate.controller";
import { MessageController } from "src/Controllers/Message/send.controller";
import { PrismaService } from "src/Interfaces/Prisma.service";
import { MessageService } from "src/Services/Message/message.service";
import { TemplateMessageService } from "src/Services/Message/templateMessage.service";


@Module({
    imports: [],
    controllers: [MessageController, MessageTemplateController ],
    providers: [ MessageService, WhatsAppGateway, TemplateMessageService, PrismaService]
})
export class MessageModule {}
