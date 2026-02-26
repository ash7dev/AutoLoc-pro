import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminUserId = process.env.ADMIN_SUPABASE_ID;

  if (!adminUserId) {
    console.warn('⚠️  ADMIN_SUPABASE_ID non défini — seed admin ignoré.');
    return;
  }

  const admin = await prisma.profile.upsert({
    where: { userId: adminUserId },
    update: { role: 'ADMIN' },
    create: {
      userId: adminUserId,
      email: process.env.ADMIN_EMAIL ?? 'admin@autoloc.sn',
      role: 'ADMIN',
    },
  });

  console.log(`✅ Admin créé / mis à jour : ${admin.email} (userId: ${admin.userId})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
