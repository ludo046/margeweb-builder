import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { JwtCookieAuthGuard } from '../auth/jwt-cookie.guard';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AddMessageDto } from './dto/add-message.dto';

@Controller('tickets')
@UseGuards(JwtCookieAuthGuard)
export class TicketsController {
  constructor(private tickets: TicketsService) {}

  @Get()
  list(@Req() req: any) {
    return this.tickets.list(req.user);
  }

  @Get(':id')
  get(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.tickets.get(req.user, id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateTicketDto) {
    return this.tickets.create(req.user, dto);
  }

  @Post(':id/messages')
  addMessage(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() dto: AddMessageDto) {
    return this.tickets.addMessage(req.user, id, dto);
  }
}
