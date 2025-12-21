import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Ticket } from '../../models/ticket.model';
import { TicketMessage } from '../../models/ticket-message.model';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { AuthModule } from '../auth/auth.module';



@Module({
  imports: [SequelizeModule.forFeature([Ticket, TicketMessage]), AuthModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
