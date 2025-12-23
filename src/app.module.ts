import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { Tenant } from './models/tenant.model';
import { User } from './models/user.model';
import { RefreshToken } from './models/refresh-token.model';
import { ImpersonationLog } from './models/impersonation-log.model';


import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';

import { Ticket } from './models/ticket.model';
import { TicketMessage } from './models/ticket-message.model';
import { TicketsModule } from './modules/tickets/tickets.module';
import { SitesModule } from './modules/sites/sites.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    SequelizeModule.forRoot({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  autoLoadModels: true,
  synchronize: false,
  logging: false,
}),


    AuthModule,

    AdminModule,

    TicketsModule,

    SitesModule,
  ],
})
export class AppModule {}
