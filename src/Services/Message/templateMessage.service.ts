import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/Interfaces/Prisma.service"; 
import { MessageTemplate } from "src/Interfaces/MessageTemplate";

@Injectable()
export class TemplateMessageService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    messageTemplate: Omit<MessageTemplate, 'id' | 'createdAt'>,
  ): Promise<MessageTemplate> {
    try {
      const existingTemplate = await this.prisma.messageTemplate.findFirst({
        where: { name: messageTemplate.name },
      });

      if (existingTemplate) {
        throw new Error("Um template com este nome já existe.");
      }

      const createdTemplate = await this.prisma.messageTemplate.create({
        data: {
          name: messageTemplate.name,
          message: messageTemplate.message,
          imageUrl: messageTemplate.imageUrl || null,
        },
      });

      return createdTemplate;
    } catch (error) {
      throw new Error(error.message || "Falha ao criar o template.");
    }
  }

  async listTemplates(): Promise<MessageTemplate[]> {
    return await this.prisma.messageTemplate.findMany();
  }

  async deleteTemplate(id: number): Promise<void> {
    try {
      // Verifica se o template existe
      const existingTemplate = await this.prisma.messageTemplate.findUnique({
        where: { id },
      });

      if (!existingTemplate) {
        throw new Error("Template não encontrado.");
      }

      // Deleta o template
      await this.prisma.messageTemplate.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(error.message || "Falha ao deletar o template.");
    }
  }
}