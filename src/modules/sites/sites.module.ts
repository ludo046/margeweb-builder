import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';
import { Site } from '../../models/site.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    SequelizeModule.forFeature([Site]),
  ],
  controllers: [SitesController],
  providers: [SitesService],
  exports: [SitesService],
})
export class SitesModule {}
