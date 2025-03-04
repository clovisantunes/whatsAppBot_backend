import { Module } from "@nestjs/common";
import { ClientsController } from "src/Controllers/Clients/GetAllClients.controller";
import { GetClientsService } from "src/Services/Clients/getClients.service";

@Module({
    imports: [],
    controllers: [ ClientsController ],
    providers: [GetClientsService ]
})
export class ClientModule {}
