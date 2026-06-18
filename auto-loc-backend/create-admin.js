const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // D'abord, créer le profile dans Supabase
    const adminUserId = 'admin-autoloc-2026';
    
    // Créer le Profile
    const profile = await prisma.profile.upsert({
      where: { userId: adminUserId },
      update: {},
      create: {
        userId: adminUserId,
        email: 'admin12@autoloc.sn',
        phone: '+221770000000',
        firstName: 'Admin',
        lastName: 'AutoLoc',
      }
    });

    console.log('✅ Profile créé:', profile.email);

    // Créer l'Utilisateur
    const admin = await prisma.utilisateur.upsert({
      where: { userId: adminUserId },
      update: {},
      create: {
        userId: adminUserId,
        email: 'admin12@autoloc.sn',
        telephone: '+221770000000',
        prenom: 'Admin',
        nom: 'AutoLoc',
        statutKyc: 'VERIFIE',
        phoneVerified: true,
        profileCompleted: true,
        actif: true,
      }
    });

    console.log('✅ Utilisateur créé:', admin.email);
    console.log('   ID:', admin.id);
    console.log('   UserID:', admin.userId);
    console.log('\n⚠️  IMPORTANT: Tu dois maintenant aller sur Supabase Auth Dashboard et:');
    console.log('   1. Créer un user avec email: admin12@autoloc.sn');
    console.log('   2. Définir son UUID comme:', adminUserId);
    console.log('   3. Lui donner le role ADMIN dans les metadata');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
