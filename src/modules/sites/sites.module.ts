import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../auth/auth.module';
import { Site } from '../../models/site.model';
import { Page } from '../../models/page.model';
import { Section } from '../../models/section.model';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';

@Module({
  imports: [SequelizeModule.forFeature([Site, Page, Section]), AuthModule],
  controllers: [SitesController],
  providers: [SitesService],
})
export class SitesModule {}
