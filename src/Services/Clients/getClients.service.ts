import { Injectable } from "@nestjs/common";
import prismaClient from "src/Prisma";

@Injectable()
export class GetClientsService {
  async findClients(): Promise<any> {
    try {
      const clients = await prismaClient.client.findMany();

      return clients;
    } catch (error) {
      throw new Error(`Erro ao buscar clientes: ${error.message}`);
    }
  }

  async deleteClient(id: number): Promise<void> {
    try {
      const existingClient = await prismaClient.client.findUnique({
        where: { id },
      });

      if (!existingClient) {
        throw new Error("Cliente não encontrado.");
      }

      await prismaClient.client.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(error.message || "Falha ao deletar o cliente.");
    }
  }
}