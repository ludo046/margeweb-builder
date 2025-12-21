import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { JwtCookieAuthGuard } from '../auth/jwt-cookie.guard';
import { SitesService } from './sites.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { CreatePageDto } from './dto/create-page.dto';
import { CreateSectionDto } from './dto/create-section.dto';

@Controller()
@UseGuards(JwtCookieAuthGuard)
export class SitesController {
  constructor(private sites: SitesService) {}

  @Get('sites')
  listSites(@Req() req: any) {
    return this.sites.listSites(req.user);
  }

  @Post('sites')
  createSite(@Req() req: any, @Body() dto: CreateSiteDto) {
    return this.sites.createSite(req.user, dto);
  }

  @Get('sites/:siteId/pages')
  listPages(@Req() req: any, @Param('siteId', ParseIntPipe) siteId: number) {
    return this.sites.listPages(req.user, siteId);
  }

  @Post('sites/:siteId/pages')
  createPage(@Req() req: any, @Param('siteId', ParseIntPipe) siteId: number, @Body() dto: CreatePageDto) {
    return this.sites.createPage(req.user, siteId, dto);
  }

  @Get('pages/:pageId/sections')
  listSections(@Req() req: any, @Param('pageId', ParseIntPipe) pageId: number) {
    return this.sites.listSections(req.user, pageId);
  }

  @Post('pages/:pageId/sections')
  createSection(@Req() req: any, @Param('pageId', ParseIntPipe) pageId: number, @Body() dto: CreateSectionDto) {
    return this.sites.createSection(req.user, pageId, dto);
  }
}
