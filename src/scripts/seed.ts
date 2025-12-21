import 'dotenv/config';
import { Sequelize } from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';
import { Tenant } from '../models/tenant.model';
import { User } from '../models/user.model';

async function run() {
  const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    models: [Tenant, User],
    logging: false,
  });

  await sequelize.authenticate();

  const [platform] = await Tenant.findOrCreate({
    where: { name: 'MargeWeb Platform' },
    defaults: { name: 'MargeWeb Platform' },
  });

  const adminEmail = 'admin@margeweb.local';
  const adminPass = 'ChangeMe!12345';
  const adminHash = await bcrypt.hash(adminPass, 12);

  await User.findOrCreate({
    where: { email: adminEmail },
    defaults: {
      tenant_id: platform.id,
      email: adminEmail,
      password_hash: adminHash,
      role: 'ADMIN_PLATFORM',
      is_2fa_enabled: false,
      totp_secret_enc: null,
      last_login_at: null,
    },
  });

  const [demo] = await Tenant.findOrCreate({
    where: { name: 'Client Demo' },
    defaults: { name: 'Client Demo' },
  });

  const demoEmail = 'client@demo.local';
  const demoPass = 'ChangeMe!12345';
  const demoHash = await bcrypt.hash(demoPass, 12);

  await User.findOrCreate({
    where: { email: demoEmail },
    defaults: {
      tenant_id: demo.id,
      email: demoEmail,
      password_hash: demoHash,
      role: 'TENANT_USER',
      is_2fa_enabled: false,
      totp_secret_enc: null,
      last_login_at: null,
    },
  });

  console.log('✅ Seed done');
  console.log(`Admin: ${adminEmail} / ${adminPass}`);
  console.log(`Client: ${demoEmail} / ${demoPass}`);

  await sequelize.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
