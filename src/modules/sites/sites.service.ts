import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Site } from '../../models/site.model';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-sites.dto';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // accents
    .replace(/[^a-z0-9]+/g, '-')     // non alnum -> -
    .replace(/^-+|-+$/g, '')         // trim -
    .slice(0, 80) || 'site';
}

@Injectable()
export class SitesService {
  constructor(@InjectModel(Site) private readonly siteModel: typeof Site) {}

  async listSites(u: any) {
    const role = u?.role ?? null;
    const tenantId = u?.tenant_id ?? null;

    if (role === 'ADMIN_PLATFORM') {
      return this.siteModel.findAll({ order: [['created_at', 'DESC']] });
    }

    if (!tenantId) throw new UnauthorizedException('Missing tenant in token');

    return this.siteModel.findAll({
      where: { tenant_id: Number(tenantId) },
      order: [['created_at', 'DESC']],
    });
  }

  private async ensureUniqueSlug(tenantId: number, base: string) {
    let slug = base;
    let i = 2;

    // cherche si slug existe déjà pour ce tenant
    // (si ta contrainte est globale, enlève tenant_id du where)
    while (
      await this.siteModel.findOne({
        where: { tenant_id: tenantId, slug },
        attributes: ['id'],
      })
    ) {
      slug = `${base}-${i++}`.slice(0, 80);
    }
    return slug;
  }

  async createSite(dto: CreateSiteDto) {
    const now = new Date();

    // ✅ slug base : subdomain si fourni, sinon name
    const base = slugify(dto.subdomain?.trim() || dto.name);
    const slug = await this.ensureUniqueSlug(dto.tenant_id, base);

    const site = await this.siteModel.create({
      tenant_id: dto.tenant_id,
      name: dto.name,
      slug, // ✅ FIX
      subdomain: dto.subdomain ?? null,
      domain: dto.domain ?? null,
      status: 'draft',
      created_at: now,
      updated_at: now,
    } as any);

    return site;
  }

  async getSite(u: any, id: number) {
    const site = await this.siteModel.findByPk(id);
    if (!site) throw new NotFoundException('Site not found');

    const role = u?.role ?? null;
    const tenantId = u?.tenant_id ?? null;

    if (role !== 'ADMIN_PLATFORM' && Number(site.tenant_id) !== Number(tenantId)) {
      throw new ForbiddenException('Forbidden');
    }

    return site;
  }

  async updateSite(u: any, id: number, dto: UpdateSiteDto) {
    const site = await this.siteModel.findByPk(id);
    if (!site) throw new NotFoundException('Site not found');

    const role = u?.role ?? null;
    const tenantId = u?.tenant_id ?? null;

    if (role !== 'ADMIN_PLATFORM' && Number(site.tenant_id) !== Number(tenantId)) {
      throw new ForbiddenException('Forbidden');
    }

    if (dto.name !== undefined) (site as any).name = dto.name;
    if (dto.status !== undefined) (site as any).status = dto.status;

    (site as any).updated_at = new Date();
    await site.save();

    return site;
  }
}
