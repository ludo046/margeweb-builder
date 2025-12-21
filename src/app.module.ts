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

    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        dialect: 'mysql',
        host: cfg.get<string>('DB_HOST'),
        port: Number(cfg.get<string>('DB_PORT')),
        database: cfg.get<string>('DB_NAME'),
        username: cfg.get<string>('DB_USER'),
        password: cfg.get<string>('DB_PASS'),
        models: [Tenant, User, RefreshToken, ImpersonationLog, Ticket, TicketMessage],
        autoLoadModels: false,
        synchronize: false,
        logging: false,
      }),
    }),

    AuthModule,

    AdminModule,

    TicketsModule,

    SitesModule,
  ],
})
export class AppModule {}
