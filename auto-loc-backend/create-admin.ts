import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Vérifier si l'admin existe déjà
    const existingUser = await prisma.utilisateur.findFirst({
      where: { email: 'admin12@autoloc.sn' }
    });

    if (existingUser) {
      console.log('❌ Admin existe déjà');
      return;
    }

    // Créer l'utilisateur admin
    const admin = await prisma.utilisateur.create({
      data: {
        userId: 'admin-' + Date.now(),
        email: 'admin12@autoloc.sn',
        telephone: '+221770000000',
        prenom: 'Admin',
        nom: 'AutoLoc',
        role: 'ADMIN',
        statut: 'ACTIF',
        kycStatut: 'VERIFIE',
        telephoneVerifie: true,
        emailVerifie: true,
      }
    });

    console.log('✅ Admin créé:', admin.email);
    console.log('ID:', admin.id);
    console.log('Role:', admin.role);
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
