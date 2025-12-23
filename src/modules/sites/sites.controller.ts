import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtCookieAuthGuard } from '../auth/jwt-cookie.guard';
import { AdminOnlyGuard } from '../admin/admin-only.guard';
import { SitesService } from './sites.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-sites.dto';

@Controller()
export class SitesController {
  constructor(private readonly sites: SitesService) {}

  @UseGuards(JwtCookieAuthGuard)
  @Get('sites')
  async listSites(@Req() req: any) {
    return this.sites.listSites(req.user);
  }

  @UseGuards(JwtCookieAuthGuard, AdminOnlyGuard)
  @Post('sites')
  async createSite(@Body() dto: CreateSiteDto) {
    return this.sites.createSite(dto);
  }

  @UseGuards(JwtCookieAuthGuard)
  @Get('sites/:id')
  async getSite(@Req() req: any, @Param('id') id: string) {
    return this.sites.getSite(req.user, Number(id));
  }

  @UseGuards(JwtCookieAuthGuard)
  @Patch('sites/:id')
  async updateSite(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateSiteDto) {
    return this.sites.updateSite(req.user, Number(id), dto);
  }
}
