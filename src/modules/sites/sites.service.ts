import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Site } from '../../models/site.model';
import { Page } from '../../models/page.model';
import { Section } from '../../models/section.model';

@Injectable()
export class SitesService {
  constructor(
    @InjectModel(Site) private siteModel: typeof Site,
    @InjectModel(Page) private pageModel: typeof Page,
    @InjectModel(Section) private sectionModel: typeof Section,
  ) {}

  private isAdmin(u: any) {
    return u?.role === 'ADMIN_PLATFORM' && !u?.imp;
  }

  private async assertSiteAccess(u: any, siteId: number) {
    const site = await this.siteModel.findByPk(siteId);
    if (!site) throw new NotFoundException('Site not found');
    if (!this.isAdmin(u) && site.tenant_id !== u.tenant_id) throw new ForbiddenException();
    return site;
  }

  async listSites(u: any) {
    const where = this.isAdmin(u) ? {} : { tenant_id: u.tenant_id };
    return this.siteModel.findAll({ where, order: [['created_at', 'DESC']], limit: 200 });
  }

  async createSite(u: any, dto: any) {
    return this.siteModel.create({
      tenant_id: u.tenant_id,
      name: dto.name,
      slug: dto.slug,
      domain: dto.domain ?? null,
      subdomain: dto.subdomain ?? null,
      status: 'draft',
    } as any);
  }

  async listPages(u: any, siteId: number) {
    await this.assertSiteAccess(u, siteId);
    return this.pageModel.findAll({ where: { site_id: siteId }, order: [['created_at', 'ASC']] });
  }

  async createPage(u: any, siteId: number, dto: any) {
    await this.assertSiteAccess(u, siteId);

    // si is_home=true, on retire is_home aux autres pages du site (V1 simple)
    if (dto.is_home) {
      await this.pageModel.update({ is_home: false }, { where: { site_id: siteId } });
    }

    return this.pageModel.create({
      site_id: siteId,
      title: dto.title,
      slug: dto.slug,
      is_home: !!dto.is_home,
      status: 'draft',
    } as any);
  }

  async getPage(u: any, pageId: number) {
    const page = await this.pageModel.findByPk(pageId);
    if (!page) throw new NotFoundException('Page not found');

    const site = await this.assertSiteAccess(u, page.site_id);
    return { page, site };
  }

  async listSections(u: any, pageId: number) {
    const page = await this.pageModel.findByPk(pageId);
    if (!page) throw new NotFoundException('Page not found');
    await this.assertSiteAccess(u, page.site_id);

    return this.sectionModel.findAll({
      where: { page_id: pageId },
      order: [['sort_order', 'ASC'], ['created_at', 'ASC']],
    });
  }

  async createSection(u: any, pageId: number, dto: any) {
    const page = await this.pageModel.findByPk(pageId);
    if (!page) throw new NotFoundException('Page not found');
    await this.assertSiteAccess(u, page.site_id);

    return this.sectionModel.create({
      page_id: pageId,
      type: dto.type,
      sort_order: dto.sort_order ?? 0,
      data: dto.data,
      style: dto.style ?? null,
    } as any);
  }
}
