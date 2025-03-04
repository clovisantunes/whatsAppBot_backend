import { Controller, Get, Delete, Body } from "@nestjs/common";
import { GetClientsService } from "src/Services/Clients/getClients.service";

@Controller('clients') // Define o prefixo da rota como '/clients'
export class ClientsController {
  constructor(private readonly getClientsService: GetClientsService) {}

  @Get() // Define o método HTTP GET para a rota '/clients'
  async getAllClients() {
    try {
      // Chama o serviço para buscar todos os clientes
      const clients = await this.getClientsService.findClients();

      // Retorna a lista de clientes com status de sucesso
      return {
        success: true,
        message: "Clientes encontrados com sucesso.",
        data: clients,
      };
    } catch (error) {
      // Em caso de erro, retorna uma mensagem de erro
      return {
        success: false,
        message: error.message || "Erro ao buscar clientes.",
      };
    }
  }

  @Delete('delete') // Define o método HTTP DELETE para a rota '/clients/delete'
  async deleteClient(
    @Body() body: { id: number }, // Recebe o ID do cliente a ser deletado
  ): Promise<{ message: string; success: boolean }> {
    try {
      // Chama o serviço para deletar o cliente
      await this.getClientsService.deleteClient(body.id);

      // Retorna uma mensagem de sucesso
      return {
        message: 'Cliente deletado com sucesso.',
        success: true,
      };
    } catch (error) {
      // Em caso de erro, retorna uma mensagem de erro
      return {
        message: error.message || 'Ocorreu um erro ao deletar o cliente.',
        success: false,
      };
    }
  }
}