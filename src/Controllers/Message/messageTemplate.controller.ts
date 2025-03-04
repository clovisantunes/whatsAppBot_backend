import { Body, Controller, Post, Delete, Get } from "@nestjs/common";
import { MessageTemplate } from "src/Interfaces/MessageTemplate";
import { TemplateMessageService } from "src/Services/Message/templateMessage.service";

@Controller('messageTemplate')
export class MessageTemplateController {
  constructor(private readonly templateMessageService: TemplateMessageService) {}

  @Post('create')
  async create(
    @Body() messageTemplate: Omit<MessageTemplate, 'id' | 'createdAt'>,
  ): Promise<{ message: string; data: MessageTemplate | null }> {
    try {
      const createdTemplate = await this.templateMessageService.execute(messageTemplate);
      return {
        message: 'Template criado com sucesso.',
        data: createdTemplate,
      };
    } catch (error) {
      return {
        message: error.message || 'Ocorreu um erro ao criar o template.',
        data: null,
      };
    }
  }
  @Get('list')
  async list(): Promise<{ message: string; data: MessageTemplate[] | null }> {
    try {
      const templates = await this.templateMessageService.listTemplates();
      return {
        message: 'Templates listados com sucesso.',
        data: templates,
      };
    } catch (error) {
      return {
        message: error.message || 'Ocorreu um erro ao listar os templates.',
        data: null,
      };
    }
  }

  @Delete('delete')
  async delete(
    @Body() body: { id: number }, // Recebe o ID da mensagem a ser deletada
  ): Promise<{ message: string; success: boolean }> {
    try {
      await this.templateMessageService.deleteTemplate(body.id);
      return {
        message: 'Template deletado com sucesso.',
        success: true,
      };
    } catch (error) {
      return {
        message: error.message || 'Ocorreu um erro ao deletar o template.',
        success: false,
      };
    }
  }
}