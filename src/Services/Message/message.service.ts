import { Injectable, Logger } from "@nestjs/common";
import * as path from "path";
import { WhatsAppGateway } from "src/config/WhatsApp.gateway";
import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";
import * as qrcode from "qrcode-terminal";
import * as fs from "fs";
import prismaClient from "src/Prisma";

@Injectable()
export class MessageService {
  public client: Client;
  private readonly logger = new Logger(MessageService.name);
  private sessionDataPath = path.join(__dirname, "..", ".wwebjs_auth");
  private isReconnecting = false;
  private isConnected = false; // Adicionado para evitar loops de reconexão desnecessários
  private prismaClient = prismaClient;

  constructor(private readonly whatsAppGateway: WhatsAppGateway) {
    this.initializeClient();
  }

  private initializeClient() {
    const sessionExists = fs.existsSync(this.sessionDataPath);

    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: this.sessionDataPath,
        clientId: "default",
      }),
      puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    });

    this.client.on("qr", (qr) => {
      if (!sessionExists) {
        this.logger.log("Escaneie este QR Code para conectar ao WhatsApp:");
        qrcode.generate(qr, { small: true });
      }
    });

    this.client.on("ready", () => {
      this.isConnected = true;
      this.logger.log("✅ Conectado ao WhatsApp Web!");
    });

    this.client.on("disconnected", async (reason) => {
      this.isConnected = false;
      this.logger.error(`❌ Desconectado do WhatsApp Web. Motivo: ${reason}`);
      await this.handleDisconnection(reason === "LOGOUT");
    });

    this.client.on("auth_failure", async (msg) => {
      this.logger.error(`❌ Falha na autenticação: ${msg}`);
      await this.handleDisconnection(false);
    });

    this.client
      .initialize()
      .catch((error) => {
        this.logger.error(`Erro ao inicializar o cliente: ${error.message}`);
        this.handleDisconnection(false);
      });
  }

  private async handleDisconnection(isManualLogout: boolean) {
    if (this.isReconnecting || this.isConnected) {
      this.logger.log("⚠ Reconexão já em andamento ou cliente já conectado.");
      return;
    }

    this.isReconnecting = true;
    this.logger.log("🔄 Iniciando processo de reconexão...");

    try {
      if (isManualLogout) {
        this.logger.log("🔄 Logout manual detectado. Reinicializando o cliente...");
      } else {
        this.logger.log("⏳ Tentando reconectar em 10 segundos...");
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }

      this.logger.log("🔄 Destruindo sessão antiga...");
      await this.client.destroy();

      this.logger.log("♻ Criando nova instância do WhatsApp...");
      this.initializeClient();
    } catch (error) {
      this.logger.error(`❌ Erro ao tentar reconectar: ${error.message}`);
    } finally {
      this.isReconnecting = false;
    }
  }

  async SendMessage(number: string, message: string, imageUrl?: string) {
    try {
      if (!number.includes('@c.us')) {
        number = number + '@c.us';
      }

      if (!this.isConnected) {
        throw new Error("O cliente do WhatsApp não está conectado.");
      }

      const existingClient = await this.prismaClient.client.findFirst({
        where: { number },
      });

      if (existingClient && existingClient.sent) {
        throw new Error("Mensagem já foi enviada para este número.");
      }

      if (imageUrl) {
        const media = await MessageMedia.fromUrl(imageUrl);
        await this.client.sendMessage(number, media, { caption: message });
      } else {
        await this.client.sendMessage(number, message);
      }

      if (existingClient) {
        await this.prismaClient.client.update({
          where: { id: existingClient.id },
          data: { sent: true, sentAt: new Date() },
        });
      } else {
        await this.prismaClient.client.create({
          data: {
            number,
            message,
            imageUrl: imageUrl || null,
            sent: true,
            sentAt: new Date(),
          },
        });
      }

      this.whatsAppGateway.emitNewMessage({
        number,
        message,
        timeStamp: new Date(),
      });

      this.logger.log(`Mensagem enviada para ${number}: ${message}`);
      return {
        success: true,
        message: "Mensagem enviada com sucesso!",
        data: {
          number,
          message,
          imageUrl,
          sentAt: new Date(),
        },
      };
    } catch (error) {
      this.logger.error(`Erro ao enviar mensagem para ${number}: ${error.message}`);
      throw {
        success: false,
        error: error.message,
        details: {
          number,
          message: error.message,
          errorType: this.getErrorType(error.message),
        },
      };
    }
  }

  async sendMessageIgnoreSent(number: string, message: string, imageUrl?: string) {
    try {
      if (!number.includes('@c.us')) {
        number = number + '@c.us';
      }

      if (!this.isConnected) {
        throw new Error("O cliente do WhatsApp não está conectado.");
      }

      if (imageUrl) {
        const media = await MessageMedia.fromUrl(imageUrl);
        await this.client.sendMessage(number, media, { caption: message });
      } else {
        await this.client.sendMessage(number, message);
      }

      const existingClient = await this.prismaClient.client.findFirst({
        where: { number },
      });

      if (existingClient) {
        await this.prismaClient.client.update({
          where: { id: existingClient.id },
          data: { sent: true, sentAt: new Date() },
        });
      } else {
        await this.prismaClient.client.create({
          data: {
            number,
            message,
            imageUrl: imageUrl || null,
            sent: true,
            sentAt: new Date(),
          },
        });
      }

      this.whatsAppGateway.emitNewMessage({
        number,
        message,
        timeStamp: new Date(),
      });

      this.logger.log(`Mensagem enviada para ${number}: ${message}`);
      return {
        success: true,
        message: "Mensagem enviada com sucesso!",
        data: {
          number,
          message,
          imageUrl,
          sentAt: new Date(),
        },
      };
    } catch (error) {
      this.logger.error(`Erro ao enviar mensagem para ${number}: ${error.message}`);
      throw {
        success: false,
        details: {
          number,
          error: error.message,
          message: error,
          errorType: this.getErrorType(error.message),
        },
      };
    }
  }

  private getErrorType(errorMessage: string): string {
    if (errorMessage.includes("não está conectado")) {
      return "CONNECTION_ERROR";
    } else if (errorMessage.includes("já foi enviada")) {
      return "MESSAGE_ALREADY_SENT";
    } else if (errorMessage.includes("número inválido")) {
      return "INVALID_NUMBER";
    } else if (errorMessage.includes("não possui WhatsApp")) {
      return "NO_WHATSAPP";
    } else {
      return "GENERIC_ERROR";
    }
  }
}