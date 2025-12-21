import { Column, CreatedAt, DataType, Model, Table, UpdatedAt } from 'sequelize-typescript';
import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';

export type PageStatus = 'draft' | 'published';

@Table({ tableName: 'pages', underscored: true })
export class Page extends Model<InferAttributes<Page>, InferCreationAttributes<Page>> {
  @Column({ type: DataType.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: CreationOptional<number>;

  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare site_id: number;

  @Column({ type: DataType.STRING(140), allowNull: false })
  declare title: string;

  @Column({ type: DataType.STRING(120), allowNull: false })
  declare slug: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare is_home: CreationOptional<boolean>;

  @Column({ type: DataType.ENUM('draft', 'published'), allowNull: false, defaultValue: 'draft' })
  declare status: CreationOptional<PageStatus>;

  @CreatedAt declare created_at: CreationOptional<Date>;
  @UpdatedAt declare updated_at: CreationOptional<Date>;
}
