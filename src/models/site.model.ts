import { Column, CreatedAt, DataType, Model, Table, UpdatedAt } from 'sequelize-typescript';
import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';

export type SiteStatus = 'draft' | 'published';

@Table({ tableName: 'sites', underscored: true })
export class Site extends Model<InferAttributes<Site>, InferCreationAttributes<Site>> {
  @Column({ type: DataType.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: CreationOptional<number>;

  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare tenant_id: number;

  @Column({ type: DataType.STRING(120), allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING(80), allowNull: false, unique: true })
  declare slug: string;

  @Column({ type: DataType.STRING(190), allowNull: true })
  declare domain: CreationOptional<string | null>;

  @Column({ type: DataType.STRING(80), allowNull: true })
  declare subdomain: CreationOptional<string | null>;

  @Column({ type: DataType.ENUM('draft', 'published'), allowNull: false, defaultValue: 'draft' })
  declare status: CreationOptional<SiteStatus>;

  @CreatedAt declare created_at: CreationOptional<Date>;
  @UpdatedAt declare updated_at: CreationOptional<Date>;
}
