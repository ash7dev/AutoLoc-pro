export function mapSupabaseError(message: string): string {
  const msg = message.toLowerCase();

  // ── Identifiants / mot de passe ──
  if (msg.includes('invalid login credentials')) return 'Email ou mot de passe incorrect.';
  if (msg.includes('password')) return 'Mot de passe trop court ou invalide.';

  // ── Email ──
  if (msg.includes('email not confirmed')) return 'Email non confirmé. Vérifiez votre boîte mail.';
  if (msg.includes('user already registered') || msg.includes('already registered')) return 'Ce compte existe déjà. Connectez-vous plutôt.';
  if (msg.includes('email link is invalid') || msg.includes('invalid token')) return 'Lien invalide ou expiré.';

  // ── Téléphone / OTP — Ordre important : du plus spécifique au plus général ──
  if (msg.includes('user not found') || msg.includes('no user found')) {
    return 'Aucun compte associé à ce numéro. Créez un compte d\'abord.';
  }
  if (msg.includes('signups not allowed') || msg.includes('signup') && msg.includes('not allowed')) {
    return 'Aucun compte associé à ce numéro. Inscrivez-vous d\'abord avec votre email.';
  }
  if (msg.includes('otp expired') || msg.includes('token has expired')) {
    return 'Code expiré. Demandez un nouveau code.';
  }
  if (msg.includes('otp') && msg.includes('invalid')) return 'Code incorrect. Vérifiez et réessayez.';
  if (msg.includes('invalid') && msg.includes('phone')) return 'Numéro de téléphone invalide. Vérifiez le format.';

  // ── Rate limit ──
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return 'Trop de tentatives. Réessayez dans quelques minutes.';
  }

  // ── Inscription désactivée ──
  if (msg.includes('signup') && msg.includes('disabled')) return 'Les inscriptions sont temporairement désactivées.';

  // ── Erreurs Réseau ──
  if (msg.includes('load failed') || msg.includes('failed to fetch')) {
    return 'Impossible de joindre le serveur. Vérifiez votre connexion.';
  }

  // ── Fallback — log pour debug ──
  console.warn('[mapSupabaseError] Unmapped error:', message);
  return `Erreur : ${message}`;
}
