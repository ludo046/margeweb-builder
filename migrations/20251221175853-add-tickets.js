'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tickets', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },

      tenant_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      site_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true }, // V1: nullable (pas encore de table sites)

      created_by_user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      assigned_admin_user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },

      subject: { type: Sequelize.STRING(140), allowNull: false },
      status: { type: Sequelize.ENUM('open', 'pending', 'solved', 'closed'), allowNull: false, defaultValue: 'open' },
      priority: { type: Sequelize.ENUM('low', 'normal', 'high', 'urgent'), allowNull: false, defaultValue: 'normal' },

      last_message_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },

      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('tickets', ['tenant_id']);
    await queryInterface.addIndex('tickets', ['created_by_user_id']);
    await queryInterface.addIndex('tickets', ['status']);
    await queryInterface.addIndex('tickets', ['last_message_at']);

    await queryInterface.createTable('ticket_messages', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },

      ticket_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      author_user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },

      body: { type: Sequelize.TEXT, allowNull: false },
      is_internal_note: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false }, // visible uniquement admin

      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('ticket_messages', ['ticket_id']);
    await queryInterface.addIndex('ticket_messages', ['author_user_id']);

    // FK tenant -> tenants
    await queryInterface.addConstraint('tickets', {
      fields: ['tenant_id'],
      type: 'foreign key',
      name: 'fk_tickets_tenant',
      references: { table: 'tenants', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // FK created_by_user_id -> users
    await queryInterface.addConstraint('tickets', {
      fields: ['created_by_user_id'],
      type: 'foreign key',
      name: 'fk_tickets_creator',
      references: { table: 'users', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    // FK assigned_admin_user_id -> users
    await queryInterface.addConstraint('tickets', {
      fields: ['assigned_admin_user_id'],
      type: 'foreign key',
      name: 'fk_tickets_assigned_admin',
      references: { table: 'users', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // FK messages -> tickets
    await queryInterface.addConstraint('ticket_messages', {
      fields: ['ticket_id'],
      type: 'foreign key',
      name: 'fk_ticket_messages_ticket',
      references: { table: 'tickets', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // FK messages -> users
    await queryInterface.addConstraint('ticket_messages', {
      fields: ['author_user_id'],
      type: 'foreign key',
      name: 'fk_ticket_messages_author',
      references: { table: 'users', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ticket_messages');
    await queryInterface.dropTable('tickets');
  },
};
