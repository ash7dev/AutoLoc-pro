const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const profilesCount = await prisma.profile.count();
  const utilisateursCount = await prisma.utilisateur.count();
  const vehiculesCount = await prisma.vehicule.count();

  console.log('=== DB COUNTS ===');
  console.log('Profiles total:', profilesCount);
  console.log('Utilisateurs total:', utilisateursCount);
  console.log('Vehicules total:', vehiculesCount);

  const profilesWithRoleProprietaire = await prisma.profile.count({
    where: { role: 'PROPRIETAIRE' }
  });
  console.log('Profiles with role PROPRIETAIRE:', profilesWithRoleProprietaire);

  const utilisateursWithVehicles = await prisma.utilisateur.count({
    where: { vehicules: { some: {} } }
  });
  console.log('Utilisateurs with at least 1 vehicle:', utilisateursWithVehicles);

  const profilesMatchingOr = await prisma.profile.findMany({
    where: {
      OR: [
        { role: 'PROPRIETAIRE' },
        { utilisateur: { vehicules: { some: {} } } }
      ]
    },
    include: {
      utilisateur: {
        include: { vehicules: true }
      }
    }
  });
  console.log('Profiles matching query (role=PROPRIETAIRE OR has vehicules):', profilesMatchingOr.length);

  const allProfiles = await prisma.profile.findMany({
    take: 10,
    include: {
      utilisateur: {
        include: { vehicules: true }
      }
    }
  });

  console.log('=== ALL PROFILES SAMPLE ===');
  console.log(JSON.stringify(allProfiles.map(p => ({
    id: p.id,
    userId: p.userId,
    email: p.email,
    role: p.role,
    utilisateur: p.utilisateur ? {
      id: p.utilisateur.id,
      prenom: p.utilisateur.prenom,
      nom: p.utilisateur.nom,
      vehiculesCount: p.utilisateur.vehicules ? p.utilisateur.vehicules.length : 0
    } : null
  })), null, 2));

  const allVehicles = await prisma.vehicule.findMany({
    take: 5,
    include: { proprietaire: true }
  });
  console.log('=== ALL VEHICLES SAMPLE ===');
  console.log(JSON.stringify(allVehicles.map(v => ({
    id: v.id,
    marque: v.marque,
    modele: v.modele,
    proprietaireId: v.proprietaireId,
    proprietaireName: v.proprietaire ? `${v.proprietaire.prenom} ${v.proprietaire.nom}` : null,
    proprietaireUserId: v.proprietaire ? v.proprietaire.userId : null
  })), null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
