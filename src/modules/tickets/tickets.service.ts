import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Ticket } from '../../models/ticket.model';
import { TicketMessage } from '../../models/ticket-message.model';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket) private ticketModel: typeof Ticket,
    @InjectModel(TicketMessage) private msgModel: typeof TicketMessage,
  ) {}

  private isAdmin(u: any) {
    return u?.role === 'ADMIN_PLATFORM' && !u?.imp; // un admin impersoné = client
  }

  async list(u: any) {
    const where: any = this.isAdmin(u) ? {} : { tenant_id: u.tenant_id };
    return this.ticketModel.findAll({ where, order: [['last_message_at', 'DESC']], limit: 100 });
  }

  async get(u: any, ticketId: number) {
    const ticket = await this.ticketModel.findByPk(ticketId);
    if (!ticket) throw new NotFoundException('Ticket not found');

    if (!this.isAdmin(u) && ticket.tenant_id !== u.tenant_id) throw new ForbiddenException();

    const msgWhere: any = { ticket_id: ticketId };
    if (!this.isAdmin(u)) msgWhere.is_internal_note = false;

    const messages = await this.msgModel.findAll({ where: msgWhere, order: [['created_at', 'ASC']] });
    return { ticket, messages };
  }

  async create(u: any, dto: { subject: string; body: string; site_id?: number }) {
    const ticket = await this.ticketModel.create({
      tenant_id: u.tenant_id,
      site_id: dto.site_id ?? null,
      created_by_user_id: u.sub,
      subject: dto.subject,
      status: 'open',
      priority: 'normal',
      last_message_at: new Date(),
    } as any);

    await this.msgModel.create({
      ticket_id: ticket.id,
      author_user_id: u.sub,
      body: dto.body,
      is_internal_note: false,
    } as any);

    return ticket;
  }

  async addMessage(u: any, ticketId: number, dto: { body: string; is_internal_note?: boolean }) {
    const ticket = await this.ticketModel.findByPk(ticketId);
    if (!ticket) throw new NotFoundException('Ticket not found');

    const admin = this.isAdmin(u);
    if (!admin && ticket.tenant_id !== u.tenant_id) throw new ForbiddenException();
    if (!admin && dto.is_internal_note) throw new ForbiddenException('Internal notes are admin-only');

    await this.msgModel.create({
      ticket_id: ticketId,
      author_user_id: u.sub,
      body: dto.body,
      is_internal_note: admin ? !!dto.is_internal_note : false,
    } as any);

    ticket.last_message_at = new Date();
    await ticket.save();

    return { ok: true };
  }
}
