export function mapSupabaseError(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes('invalid login credentials')) return 'Identifiants invalides';
  if (msg.includes('email not confirmed')) return 'Email non confirmé';
  if (msg.includes('user already registered')) return 'Email déjà utilisé';
  if (msg.includes('token has expired')) return 'Code expiré, renvoie un nouveau code';
  if (msg.includes('rate limit')) return 'Trop de tentatives, réessaie plus tard';
  if (msg.includes('otp')) return 'Code invalide';
  if (msg.includes('phone')) return 'Numéro de téléphone invalide';

  return 'Une erreur est survenue';
}
