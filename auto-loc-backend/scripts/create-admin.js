"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const supabase_js_1 = require("@supabase/supabase-js");
const prisma = new client_1.PrismaClient();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis');
    process.exit(1);
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
async function createAdmin() {
    const email = 'admin12@autoloc.sn';
    const password = 'NicoxJean1';
    console.log('🔄 Création de l\'utilisateur admin dans Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    });
    if (authError) {
        if (authError.message.includes('already registered') || authError.code === 'email_exists') {
            console.log('⚠️  Utilisateur déjà existant dans Supabase Auth');
            const { data: users } = await supabase.auth.admin.listUsers();
            const existingUser = users?.users.find((u) => u.email === email);
            if (!existingUser) {
                console.error('❌ Impossible de récupérer l\'utilisateur existant');
                process.exit(1);
            }
            console.log(`✅ Utilisateur trouvé : ${existingUser.id}`);
            console.log('🔄 Mise à jour du mot de passe...');
            const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, { password });
            if (updateError) {
                console.error('⚠️  Erreur lors de la mise à jour du mot de passe:', updateError.message);
            }
            else {
                console.log('✅ Mot de passe mis à jour');
            }
            await updateProfile(existingUser.id, email);
            return;
        }
        console.error('❌ Erreur lors de la création de l\'utilisateur:', authError);
        process.exit(1);
    }
    console.log(`✅ Utilisateur créé dans Supabase Auth : ${authData.user.id}`);
    await updateProfile(authData.user.id, email);
}
async function updateProfile(userId, email) {
    console.log('🔄 Création/mise à jour du profil dans la base de données...');
    const profile = await prisma.profile.upsert({
        where: { userId },
        update: {
            role: 'ADMIN',
            email,
        },
        create: {
            userId,
            email,
            role: 'ADMIN',
        },
    });
    console.log(`✅ Profil admin créé/mis à jour : ${profile.email} (role: ${profile.role})`);
    const utilisateur = await prisma.utilisateur.upsert({
        where: { userId },
        update: {
            email,
            profileCompleted: true,
        },
        create: {
            userId,
            email,
            telephone: '+221000000000',
            prenom: 'Admin',
            nom: 'AutoLoc',
            profileCompleted: true,
            phoneVerified: true,
        },
    });
    console.log(`✅ Utilisateur admin créé/mis à jour : ${utilisateur.email}`);
}
createAdmin()
    .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=create-admin.js.map