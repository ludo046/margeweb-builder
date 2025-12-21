import { Column, CreatedAt, DataType, Model, Table, UpdatedAt } from 'sequelize-typescript';
import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';

export type SectionType =
  | 'hero' | 'features' | 'gallery' | 'testimonials' | 'pricing'
  | 'faq' | 'cta' | 'contact' | 'header' | 'footer';

@Table({ tableName: 'sections', underscored: true })
export class Section extends Model<InferAttributes<Section>, InferCreationAttributes<Section>> {
  @Column({ type: DataType.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: CreationOptional<number>;

  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare page_id: number;

  @Column({
    type: DataType.ENUM(
      'hero','features','gallery','testimonials','pricing','faq','cta','contact','header','footer'
    ),
    allowNull: false,
  })
  declare type: SectionType;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare sort_order: CreationOptional<number>;

  @Column({ type: DataType.JSON, allowNull: false })
  declare data: any;

  @Column({ type: DataType.JSON, allowNull: true })
  declare style: CreationOptional<any | null>;

  @CreatedAt declare created_at: CreationOptional<Date>;
  @UpdatedAt declare updated_at: CreationOptional<Date>;
}
