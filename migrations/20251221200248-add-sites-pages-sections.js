'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sites', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },

      tenant_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },

      name: { type: Sequelize.STRING(120), allowNull: false },
      slug: { type: Sequelize.STRING(80), allowNull: false }, // ex: "client-demo"
      domain: { type: Sequelize.STRING(190), allowNull: true }, // ex: "client.com"
      subdomain: { type: Sequelize.STRING(80), allowNull: true }, // ex: "client-demo" -> client-demo.margeweb.site

      status: { type: Sequelize.ENUM('draft', 'published'), allowNull: false, defaultValue: 'draft' },

      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('sites', ['tenant_id']);
    await queryInterface.addIndex('sites', ['slug'], { unique: true });

    await queryInterface.addConstraint('sites', {
      fields: ['tenant_id'],
      type: 'foreign key',
      name: 'fk_sites_tenant',
      references: { table: 'tenants', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.createTable('pages', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },

      site_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },

      title: { type: Sequelize.STRING(140), allowNull: false },
      slug: { type: Sequelize.STRING(120), allowNull: false }, // ex: "home", "contact"
      is_home: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      status: { type: Sequelize.ENUM('draft', 'published'), allowNull: false, defaultValue: 'draft' },

      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('pages', ['site_id']);
    await queryInterface.addIndex('pages', ['site_id', 'slug'], { unique: true });

    await queryInterface.addConstraint('pages', {
      fields: ['site_id'],
      type: 'foreign key',
      name: 'fk_pages_site',
      references: { table: 'sites', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.createTable('sections', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },

      page_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },

      type: {
        type: Sequelize.ENUM(
          'hero',
          'features',
          'gallery',
          'testimonials',
          'pricing',
          'faq',
          'cta',
          'contact',
          'header',
          'footer'
        ),
        allowNull: false,
      },

      sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },

      // contenu “DB-driven”
      data: { type: Sequelize.JSON, allowNull: false }, // schema par type
      style: { type: Sequelize.JSON, allowNull: true }, // couleurs, padding, fonts…

      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('sections', ['page_id']);
    await queryInterface.addIndex('sections', ['page_id', 'sort_order']);

    await queryInterface.addConstraint('sections', {
      fields: ['page_id'],
      type: 'foreign key',
      name: 'fk_sections_page',
      references: { table: 'pages', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sections');
    await queryInterface.dropTable('pages');
    await queryInterface.dropTable('sites');
  },
};
