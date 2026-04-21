export function mapSupabaseError(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes('invalid login credentials')) return 'Identifiants invalides';
  if (msg.includes('email not confirmed')) return 'Email non confirmé. Vérifiez votre boîte mail.';
  if (msg.includes('user already registered') || msg.includes('already registered')) return 'Email déjà utilisé';
  if (msg.includes('token has expired')) return 'Code expiré. Demandez un nouveau code.';
  if (msg.includes('rate limit')) return 'Trop de tentatives. Réessayez dans quelques minutes.';
  if (msg.includes('otp expired') || msg.includes('otp')) return 'Code invalide ou expiré';
  if (msg.includes('user not found') || msg.includes('no user found')) {
    return 'Aucun compte trouvé pour ce numéro. Créez un compte d\'abord.';
  }
  if (msg.includes('phone') && !msg.includes('not found')) return 'Numéro de téléphone invalide';
  if (msg.includes('signup') && msg.includes('disabled')) return 'Les inscriptions sont temporairement désactivées.';
  if (msg.includes('email link is invalid') || msg.includes('invalid token')) return 'Lien invalide ou expiré.';
  if (msg.includes('password')) return 'Mot de passe trop court ou invalide';

  return 'Une erreur est survenue';
}

