import { Column, CreatedAt, DataType, Model, Table, UpdatedAt } from 'sequelize-typescript';
import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';

@Table({ tableName: 'ticket_messages', underscored: true })
export class TicketMessage extends Model<InferAttributes<TicketMessage>, InferCreationAttributes<TicketMessage>> {
  @Column({ type: DataType.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: CreationOptional<number>;

  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare ticket_id: number;

  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare author_user_id: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare body: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare is_internal_note: CreationOptional<boolean>;

  @CreatedAt declare created_at: CreationOptional<Date>;
  @UpdatedAt declare updated_at: CreationOptional<Date>;
}
