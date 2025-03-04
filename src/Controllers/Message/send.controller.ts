import { Body, Controller, Post, Request, BadRequestException } from "@nestjs/common";
import { MessageService } from "src/Services/Message/message.service";

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('send')
  async sendMessage(@Request() req, @Body() body: { to: string[], message: string }) {
    if (!Array.isArray(body.to) || body.to.length === 0) {
      throw new BadRequestException({
        success: false,
        error: "A lista de destinatários deve ser um array não vazio.",
        errorType: "INVALID_RECIPIENTS",
      });
    }

    try {
      const sendResults = await Promise.all(
        body.to.map(async (number) => {
          return await this.messageService.SendMessage(number, body.message);
        })
      );
      return { success: true, data: sendResults };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('sendIgnoreSent')
  async sendMessageIgnoreSent(@Request() req, @Body() body: { to: string[], message: string }) {
    if (!Array.isArray(body.to) || body.to.length === 0) {
      throw new BadRequestException({
        success: false,
        error: "A lista de destinatários deve ser um array não vazio.",
        errorType: "INVALID_RECIPIENTS",
      });
    }

    try {
      const sendResults = await Promise.all(
        body.to.map(async (number) => {
          return await this.messageService.sendMessageIgnoreSent(number, body.message);
        })
      );
      return { success: true, data: sendResults };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
