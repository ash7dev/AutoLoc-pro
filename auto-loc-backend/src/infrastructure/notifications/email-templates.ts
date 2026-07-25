// ── Email Templates ─────────────────────────────────────────────────────────────
// Design premium — charte AutoLoc : noir profond · vert émeraude · blanc pur
// Compatible tous clients mail (inline styles, table layout, pas de CSS custom props)

export type NotificationType =
  | 'reservation.created'
  | 'reservation.confirmed'
  | 'reservation.paid'
  | 'reservation.paid.owner'
  | 'reservation.cancelled'
  | 'reservation.checkin'
  | 'reservation.checkin.owner_confirmed'
  | 'reservation.checkin.tenant_confirmed'
  | 'reservation.checkin.reminder_veille'
  | 'reservation.checkin.reminder_jour'
  | 'reservation.checkin.reminder_urgent'
  | 'reservation.checkin.tacit_window'
  | 'reservation.checkin.tacit_applied'
  | 'reservation.checkout'
  | 'reservation.checkout.reminder'
  | 'avis.request'
  | 'avis.recu'
  | 'verification.code'
  | 'kyc.verified'
  | 'kyc.rejected'
  | 'litige.ouvert'
  | 'litige.resolu'
  | 'user.welcome'
  | 'wallet.credited'
  | 'auth.login_otp'
  | 'user.status_changed'
  | 'vehicle.validated'
  | 'vehicle.suspended'
  | 'vehicle.featured'
  | 'admin.withdrawal.requested'
  | 'admin.reservation.cancelled'
  | 'admin.refund.processed';

interface TemplateConfig {
  subject: string;
  body: (data: Record<string, unknown>) => string;
}

// ── Brand tokens ────────────────────────────────────────────────────────────────

const EMERALD = '#10b981';
const EMERALD_DARK = '#059669';
const EMERALD_BG = '#ecfdf5';
const DARK = '#111827';
const GRAY = '#6b7280';
const LIGHT_GRAY = '#f9fafb';
const BORDER = '#e5e7eb';
const WHITE = '#ffffff';
const FRONTEND_URL = 'https://autoloc.sn';
const LOGO_URL = `${FRONTEND_URL}/logoAutoLoc.jpg`;
const FOOTER_LOGO_URL = `${FRONTEND_URL}/footerlogo.jpg`;

// ── Base layout ─────────────────────────────────────────────────────────────────

function baseLayout(opts: {
  title: string;
  subtitle?: string;
  badge?: { text: string; color: string; bg: string };
  content: string;
  cta?: { label: string; href: string };
  accentColor?: string;
}): string {
  const badge = opts.badge
    ? `<div style="margin-bottom:20px;">
            <span style="display:inline-block;background:${opts.badge.bg};color:${opts.badge.color};
              font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
              padding:4px 12px;border-radius:100px;border:1px solid ${opts.badge.color}33;">
              ${opts.badge.text}
            </span>
           </div>`
    : '';

  const ctaBlock = opts.cta
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
            <tr>
              <td align="center">
                <a href="${opts.cta.href}"
                  style="display:inline-block;background:${EMERALD};color:#fff;
                    font-size:14px;font-weight:700;letter-spacing:0.02em;
                    text-decoration:none;padding:14px 32px;border-radius:12px;
                    box-shadow:0 4px 14px ${EMERALD}55;">
                  ${opts.cta.label} →
                </a>
              </td>
            </tr>
           </table>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">

      <!-- Card -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="max-width:580px;background:${WHITE};border-radius:20px;overflow:hidden;
          box-shadow:0 8px 40px rgba(0,0,0,0.10),0 1px 3px rgba(0,0,0,0.06);">

        <!-- ══ HEADER + TITLE (dark glass block) ══ -->
        <tr>
          <td bgcolor="#08080f" style="background:linear-gradient(160deg,#08080f 0%,#0d1a14 60%,#080f0d 100%);padding:0;">

            <!-- Ligne accent top émeraude -->
            <div style="height:2px;background:linear-gradient(90deg,transparent 0%,${EMERALD} 30%,${EMERALD_DARK} 70%,transparent 100%);"></div>

            <!-- Glass panel intérieur -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:40px 40px 0;">

                  <!-- Logo sur fond sombre — footerlogo.jpg (version claire) -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"
                    style="background:linear-gradient(135deg,rgba(255,255,255,0.04) 0%,rgba(16,185,129,0.06) 100%);
                      border:1px solid rgba(16,185,129,0.18);border-radius:16px;padding:28px 24px;">
                    <tr>
                      <td align="center">
                        <img src="${FOOTER_LOGO_URL}" alt="AutoLoc" width="160" height="64"
                          style="display:block;object-fit:contain;max-width:160px;">
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-top:14px;">
                        <span style="display:inline-block;
                          background:linear-gradient(135deg,rgba(16,185,129,0.12),rgba(5,150,105,0.08));
                          border:1px solid rgba(16,185,129,0.35);
                          color:${EMERALD};font-size:10px;font-weight:700;letter-spacing:0.14em;
                          text-transform:uppercase;padding:5px 16px;border-radius:100px;">
                          Location de véhicules entre particuliers
                        </span>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Séparateur interne dégradé -->
              <tr>
                <td style="padding:28px 40px 0;">
                  <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(16,185,129,0.4),transparent);"></div>
                </td>
              </tr>

              <!-- Title band -->
              <tr>
                <td style="padding:24px 40px 36px;">
                  ${badge}
                  <h1 style="margin:0;font-size:27px;font-weight:800;color:#ffffff;
                    letter-spacing:-0.03em;line-height:1.2;">
                    ${opts.title}
                  </h1>
                  ${opts.subtitle
      ? `<p style="margin:10px 0 0;font-size:14px;color:#ffffff;line-height:1.6;font-weight:400;">${opts.subtitle}</p>`
      : ''}
                </td>
              </tr>
            </table>

            <!-- Ligne accent bas -->
            <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(16,185,129,0.25),transparent);"></div>
          </td>
        </tr>

        <!-- ══ BODY ══ -->
        <tr>
          <td style="padding:36px;">
            ${opts.content}
            ${ctaBlock}
          </td>
        </tr>

        <!-- ══ FOOTER ══ -->
        <tr>
          <td style="background:${LIGHT_GRAY};border-top:1px solid ${BORDER};padding:24px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <p style="margin:0;font-size:12px;color:${GRAY};line-height:1.6;">
                    <strong style="color:${DARK};">AutoLoc</strong> — Location de véhicules entre particuliers au Sénégal.<br>
                    Des questions ? Contactez-nous à
                    <a href="mailto:support@autoloc.sn" style="color:${EMERALD};text-decoration:none;">support@autoloc.sn</a>
                  </p>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <a href="${FRONTEND_URL}" style="text-decoration:none;">
                    <img src="${LOGO_URL}" alt="AutoLoc" width="60" height="24"
                      style="display:block;object-fit:contain;opacity:0.7;">
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
      <!-- /Card -->

      <!-- Legal note -->
      <p style="margin:20px 0 0;font-size:11px;color:#94a3b8;text-align:center;">
        Vous recevez cet email car vous avez un compte AutoLoc.
        <a href="${FRONTEND_URL}/dashboard/settings/notifications"
          style="color:#94a3b8;">Se désabonner</a>
      </p>

    </td></tr>
  </table>
</body>
</html>`.trim();
}

// ── Helpers ─────────────────────────────────────────────────────────────────────

function p(text: string, style = ''): string {
  return `<p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;${style}">${text}</p>`;
}

function infoCard(rows: { label: string; value: string; icon?: string }[]): string {
  const rowsHtml = rows.map(({ label, value, icon }) => `
      <tr>
        <td style="padding:14px 20px;border-bottom:1px solid ${BORDER};">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td>
                <span style="display:block;font-size:11px;font-weight:600;color:${GRAY};
                  text-transform:uppercase;letter-spacing:0.07em;margin-bottom:3px;">
                  ${icon ? icon + ' ' : ''}${label}
                </span>
                <span style="font-size:15px;font-weight:700;color:${DARK};">${value}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>`).join('');

  return `
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="margin:20px 0;border-radius:12px;overflow:hidden;
          border:1px solid ${BORDER};background:${LIGHT_GRAY};">
        <tr>
          <td style="background:${EMERALD};height:3px;padding:0;font-size:0;">&nbsp;</td>
        </tr>
        ${rowsHtml}
      </table>`;
}

function alertBox(text: string, type: 'warning' | 'error' | 'info' = 'info'): string {
  const colors = {
    warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' },
    error: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' },
    info: { bg: EMERALD_BG, border: EMERALD, text: '#065f46' },
  };
  const c = colors[type];
  return `
      <div style="background:${c.bg};border-left:4px solid ${c.border};border-radius:0 10px 10px 0;
        padding:14px 18px;margin:20px 0;">
        <p style="margin:0;font-size:14px;font-weight:600;color:${c.text};line-height:1.6;">${text}</p>
      </div>`;
}

function divider(): string {
  return `<div style="height:1px;background:${BORDER};margin:24px 0;"></div>`;
}

// ── Templates ───────────────────────────────────────────────────────────────────

export const EMAIL_TEMPLATES: Record<NotificationType, TemplateConfig> = {
  // ── Bienvenue ────────────────────────────────────────────────────────────────
  'user.welcome': {
    subject: '🚗 Votre compte AutoLoc est prêt — Une étape et c\'est parti',
    body: (data) => baseLayout({
      title: `Bienvenue${data.prenom ? `, ${data.prenom}` : ''} !`,
      subtitle: 'Vérifiez votre identité en 2 minutes et accédez à tout.',
      badge: { text: 'Nouveau membre', color: EMERALD, bg: EMERALD_BG },
      cta: { label: 'Vérifier mon identité →', href: `${FRONTEND_URL}/login?next=${encodeURIComponent('/dashboard/owner/kyc')}&role=PROPRIETAIRE` },
      content: [
        infoCard([
          { label: 'Étape 1 — Maintenant', value: 'Vérifier votre identité (2 min)', icon: '🪪' },
          { label: 'Étape 2 — Après validation', value: 'Louez ou publiez un véhicule', icon: '🔑' },
        ]),
        alertBox('La vérification est <strong>obligatoire</strong> pour louer ou publier. Elle protège toute la communauté AutoLoc.', 'info'),
      ].join(''),
    }),
  },

  // ── Réservation créée ────────────────────────────────────────────────────────
  'reservation.created': {
    subject: '⏳ Votre réservation est en attente de paiement',
    body: (data) => baseLayout({
      title: 'Réservation initiée',
      subtitle: 'Finalisez votre paiement pour confirmer.',
      badge: { text: 'En attente de paiement', color: '#92400e', bg: '#fffbeb' },
      cta: { label: 'Finaliser le paiement', href: `${FRONTEND_URL}/dashboard/reservations` },
      content: [
        p(`Bonjour${data.prenom ? ` <strong>${data.prenom}</strong>` : ''},`),
        p('Votre demande de réservation a bien été enregistrée sur AutoLoc.'),
        data.vehicule ? infoCard([
          { label: 'Véhicule', value: String(data.vehicule), icon: '🚗' },
          { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
        ]) : '',
        alertBox('⚠️ Cette réservation sera automatiquement annulée si le paiement n\'est pas reçu dans les <strong>48 heures</strong>.', 'warning'),
      ].join(''),
    }),
  },

  // ── Paiement confirmé ────────────────────────────────────────────────────────
  'reservation.paid': {
    subject: '✅ Paiement reçu — On s\'occupe du reste',
    body: (data) => baseLayout({
      title: 'Paiement reçu !',
      subtitle: 'Votre argent est sécurisé. Le propriétaire a 24h pour confirmer.',
      badge: { text: 'Paiement sécurisé', color: EMERALD_DARK, bg: EMERALD_BG },
      cta: { label: 'Suivre ma réservation', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
      content: [
        infoCard([
          { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
          { label: 'Statut', value: 'En attente de confirmation du propriétaire', icon: '⏳' },
        ]),
        alertBox('Votre paiement est <strong>bloqué en escrow</strong> — il ne sera libéré qu\'après confirmation du check-in. Si le propriétaire ne confirme pas sous 24h, vous êtes <strong>remboursé automatiquement</strong>.', 'info'),
      ].join(''),
    }),
  },

  // ── Paiement confirmé (Propriétaire) ───────────────────────────────────────
  'reservation.paid.owner': {
    subject: '💰 Nouvelle réservation payée — Action requise sous 24h',
    body: (data) => {
      const isDeposit = data.modePaiement === 'ACOMPTE_SOLDE_CHECKIN' || Number(data.montantSoldeCheckin ?? 0) > 0;
      const soldeStr = data.montantSoldeCheckin ? `${Number(data.montantSoldeCheckin).toLocaleString('fr-FR')} FCFA` : null;

      return baseLayout({
        title: 'Félicitations ! Votre véhicule est réservé',
        subtitle: 'Le paiement est sécurisé. Confirmez pour finaliser la location.',
        badge: { text: 'Nouvelle réservation', color: EMERALD_DARK, bg: EMERALD_BG },
        cta: {
          label: 'Confirmer la réservation →',
          href: `${FRONTEND_URL}/login?next=${encodeURIComponent(`/dashboard/owner/reservations/${data.reservationId ?? ''}`)}&role=PROPRIETAIRE`,
        },
        content: [
          infoCard([
            { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
            { label: 'Modalité de paiement', value: isDeposit ? 'Acompte 30% en ligne' : 'Paiement 100% en ligne', icon: '💳' },
            ...(isDeposit && soldeStr ? [{ label: 'Solde à percevoir au check-in (en main propre)', value: soldeStr, icon: '💵' }] : []),
            { label: 'Délai de réponse', value: '24 heures', icon: '⏰' },
          ]),
          alertBox(
            '⏰ <strong>Important :</strong> Vous avez <strong>24 heures</strong> pour confirmer. ' +
            'Passé ce délai, la réservation sera annulée et le locataire remboursé automatiquement.',
            'warning'
          ),
          ...(isDeposit && soldeStr ? [alertBox(`💡 <strong>Rappel Acompte :</strong> Le locataire a réglé l'acompte de 30% en ligne. N'oubliez pas de percevoir le solde de <strong>${soldeStr}</strong> lors de la remise des clés et de cocher la confirmation sur l'application lors du check-in.`, 'info')] : []),
          divider(),
          p('<strong>Prochaines étapes :</strong>'),
          `<ol style="margin:0 0 16px;padding-left:20px;color:#374151;font-size:15px;line-height:1.8;">
                    <li>Confirmez la réservation</li>
                    <li>Contactez le locataire si besoin</li>
                    <li>Préparez le véhicule pour le check-in</li>
                  </ol>`,
        ].join(''),
      });
    },
  },

  // ── Réservation confirmée ────────────────────────────────────────────────────
  'reservation.confirmed': {
    subject: '🎉 C\'est confirmé — Préparez-vous !',
    body: (data) => {
      const isDeposit = data.modePaiement === 'ACOMPTE_SOLDE_CHECKIN' || Number(data.montantSoldeCheckin ?? 0) > 0;
      const soldeStr = data.montantSoldeCheckin ? `${Number(data.montantSoldeCheckin).toLocaleString('fr-FR')} FCFA` : null;

      return baseLayout({
        title: `C'est confirmé${data.locatairePrenom ? `, ${data.locatairePrenom}` : ''} !`,
        subtitle: 'Le propriétaire a validé. Votre location est officielle.',
        badge: { text: 'Confirmée', color: EMERALD_DARK, bg: EMERALD_BG },
        cta: { label: 'Voir les détails', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
        content: [
          infoCard([
            { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
            { label: 'Modalité de paiement', value: isDeposit ? 'Acompte 30% réglé' : '100% réglé en ligne', icon: '💳' },
            ...(isDeposit && soldeStr ? [{ label: 'Solde restant dû au check-in', value: soldeStr, icon: '💵' }] : []),
            ...(data.locatairePhone ? [{ label: 'Contact propriétaire', value: String(data.locatairePhone), icon: '📞' }] : []),
            { label: 'Prochaine étape', value: 'Check-in le jour J', icon: '🔑' },
          ]),
          ...(isDeposit && soldeStr
            ? [alertBox(`💵 <strong>Rappel Solde :</strong> Vous avez réglé un acompte de 30%. Veuillez prévoir le solde de <strong>${soldeStr}</strong> à remettre directement au propriétaire lors de la remise des clés.`, 'warning')]
            : []),
          alertBox('Le jour de la prise en charge, <strong>les deux parties doivent confirmer le check-in</strong> sur AutoLoc pour démarrer officiellement la location et libérer le paiement.', 'info'),
        ].join(''),
      });
    },
  },

  // ── Réservation annulée ──────────────────────────────────────────────────────
  'reservation.cancelled': {
    subject: '❌ Réservation annulée',
    body: (data) => baseLayout({
      title: 'Réservation annulée',
      subtitle: data.cancelledBy === 'PROPRIETAIRE'
        ? 'Le propriétaire a annulé. Votre remboursement est en cours.'
        : 'Votre réservation a été annulée.',
      badge: { text: 'Annulée', color: '#991b1b', bg: '#fef2f2' },
      accentColor: '#ef4444',
      cta: { label: 'Trouver un autre véhicule', href: `${FRONTEND_URL}/explorer` },
      content: [
        infoCard([
          { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
          { label: 'Annulée par', value: data.cancelledBy === 'PROPRIETAIRE' ? 'Le propriétaire' : 'Vous', icon: '👤' },
          ...(data.raison ? [{ label: 'Motif', value: String(data.raison), icon: '📝' }] : []),
          ...(data.refundAmount ? [{ label: 'Remboursement', value: `${Number(data.refundAmount).toLocaleString('fr-FR')} FCFA`, icon: '💸' }] : []),
        ]),
        data.refundAmount
          ? alertBox(`Votre remboursement de <strong>${Number(data.refundAmount).toLocaleString('fr-FR')} FCFA</strong> sera crédité sous <strong>3 à 5 jours ouvrables</strong>.`, 'info')
          : alertBox('Aucun remboursement prévu selon les conditions d\'annulation.', 'warning'),
      ].join(''),
    }),
  },

  // ── Check-in confirmé (les deux parties) ─────────────────────────────────────
  'reservation.checkin': {
    subject: '🚗 Check-in effectué — Bonne route !',
    body: (data) => baseLayout({
      title: 'Check-in validé !',
      subtitle: 'Les deux parties ont confirmé. La location commence.',
      badge: { text: 'En cours', color: EMERALD_DARK, bg: EMERALD_BG },
      cta: { label: 'Voir ma réservation', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
      content: [
        p('Le check-in a été validé par les deux parties. La location est officiellement en cours.'),
        infoCard([
          { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
          { label: 'Statut', value: 'Location en cours', icon: '🟢' },
        ]),
        alertBox('Pensez à effectuer le <strong>check-out</strong> à la fin de la location pour clôturer officiellement le contrat.', 'info'),
      ].join(''),
    }),
  },

  // ── Check-in partiel — propriétaire a confirmé ────────────────────────────────
  'reservation.checkin.owner_confirmed': {
    subject: '⏳ Le propriétaire a confirmé le check-in — À votre tour !',
    body: (data) => baseLayout({
      title: 'Check-in en attente',
      subtitle: 'Le propriétaire a confirmé. Il ne manque que vous.',
      badge: { text: 'Action requise', color: '#92400e', bg: '#fffbeb' },
      accentColor: '#f59e0b',
      cta: { label: 'Confirmer le check-in', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
      content: [
        p('Le propriétaire a confirmé la remise du véhicule. Il ne manque plus que <strong>votre confirmation</strong> pour démarrer officiellement la location.'),
        infoCard([
          { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
          { label: 'Propriétaire', value: '✅ Confirmé', icon: '👤' },
          { label: 'Locataire', value: '⏳ En attente', icon: '👤' },
        ]),
        alertBox('Connectez-vous sur AutoLoc et confirmez le check-in depuis votre espace réservation.', 'warning'),
      ].join(''),
    }),
  },

  // ── Check-in partiel — locataire a confirmé ──────────────────────────────────
  'reservation.checkin.tenant_confirmed': {
    subject: '⏳ Le locataire a confirmé le check-in — À votre tour !',
    body: (data) => baseLayout({
      title: 'Check-in en attente',
      subtitle: 'Le locataire a confirmé. Il ne manque que vous.',
      badge: { text: 'Action requise', color: '#92400e', bg: '#fffbeb' },
      accentColor: '#f59e0b',
      cta: { label: 'Confirmer le check-in', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
      content: [
        p('Le locataire a confirmé la réception du véhicule. Il ne manque plus que <strong>votre confirmation</strong> pour démarrer officiellement la location.'),
        infoCard([
          { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
          { label: 'Locataire', value: '✅ Confirmé', icon: '👤' },
          { label: 'Propriétaire', value: '⏳ En attente', icon: '👤' },
        ]),
        alertBox('Connectez-vous sur AutoLoc et confirmez le check-in depuis votre espace réservation.', 'warning'),
      ].join(''),
    }),
  },

  // ── Fenêtre validation tacite (email locataire, en parallèle des relances WhatsApp) ─
  'reservation.checkin.tacit_window': {
    subject: '⏱️ 6 h pour valider votre check-in — AutoLoc',
    body: (data) => baseLayout({
      title: 'Le propriétaire a enregistré le départ',
      subtitle: 'Validez ou signalez un problème dans les 6 heures.',
      badge: { text: 'Action requise', color: '#92400e', bg: '#fffbeb' },
      accentColor: '#f59e0b',
      cta: { label: 'Ouvrir la réservation', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
      content: [
        p('Le propriétaire a confirmé le check-in et l\'état des lieux de départ. <strong>Validez votre check-in</strong> dans l\'application ou signalez un litige si vous n\'êtes pas d\'accord.'),
        p('Sans action de votre part dans les <strong>6 heures</strong>, la location sera considérée comme démarrée sur la base de l\'état des lieux enregistré par le propriétaire (validation tacite, voir CGU).'),
        infoCard([
          { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
        ]),
      ].join(''),
    }),
  },

  'reservation.checkin.tacit_applied': {
    subject: '🟢 Location démarrée — validation tacite du check-in',
    body: (data) => baseLayout({
      title: 'Check-in validé automatiquement',
      subtitle: 'Vous n’aviez pas confirmé dans le délai imparti.',
      badge: { text: 'En cours', color: EMERALD_DARK, bg: EMERALD_BG },
      cta: { label: 'Voir la réservation', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
      content: [
        p('La location est considérée comme <strong>démarrée</strong> : vous pouvez encore <strong>signaler un problème</strong> via le support ou la section litige selon nos conditions générales.'),
        infoCard([
          { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
        ]),
      ].join(''),
    }),
  },

  // ── Rappel check-in la veille ─────────────────────────────────────────────────
  'reservation.checkin.reminder_veille': {
    subject: '📅 Demain c\'est le grand jour — Prêt pour le check-in ?',
    body: (data) => baseLayout({
      title: 'Votre location commence demain',
      subtitle: 'Retrouvez l\'autre partie et confirmez la remise sur l\'app.',
      badge: { text: 'Rappel J-1', color: '#1e40af', bg: '#eff6ff' },
      accentColor: '#3b82f6',
      cta: { label: 'Voir ma réservation', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
      content: [
        infoCard([
          { label: 'Date de début', value: String(data.dateDebut ?? ''), icon: '📅' },
          { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
        ]),
        alertBox('Les <strong>deux parties doivent confirmer le check-in</strong> sur AutoLoc le jour J. Sans check-in, le paiement reste bloqué et la location ne démarre pas officiellement.', 'info'),
      ].join(''),
    }),
  },

  // ── Rappel check-in jour J ────────────────────────────────────────────────────
  'reservation.checkin.reminder_jour': {
    subject: '🚨 Check-in non fait — Il vous reste jusqu\'à minuit',
    body: (data) => baseLayout({
      title: 'Check-in urgent',
      subtitle: 'La location a commencé mais le check-in n\'est pas finalisé.',
      badge: { text: 'Urgent', color: '#991b1b', bg: '#fef2f2' },
      accentColor: '#ef4444',
      cta: { label: 'Faire le check-in maintenant →', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
      content: [
        infoCard([
          { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
          { label: 'Délai limite', value: 'Ce soir avant minuit', icon: '⏰' },
        ]),
        alertBox('⚠️ Sans check-in avant minuit, la réservation sera <strong>annulée automatiquement</strong> et le paiement remboursé. Agissez maintenant.', 'error'),
      ].join(''),
    }),
  },

  // ── Rappel check-in urgent (T+2h sans check-in) ──────────────────────────────
  'reservation.checkin.reminder_urgent': {
    subject: '⏰ Check-in en retard — Agissez avant minuit',
    body: (data) => baseLayout({
      title: 'Le check-in n\'a pas été effectué',
      subtitle: 'La location aurait dû commencer. Agissez avant minuit.',
      badge: { text: 'Retard check-in', color: '#991b1b', bg: '#fef2f2' },
      accentColor: '#ef4444',
      cta: { label: 'Faire le check-in maintenant →', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
      content: [
        infoCard([
          { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
          { label: 'Délai limite', value: 'Ce soir avant minuit', icon: '⏰' },
        ]),
        alertBox('⚠️ Sans check-in avant minuit, la réservation sera <strong>annulée automatiquement</strong> et le paiement remboursé. Agissez maintenant.', 'error'),
      ].join(''),
    }),
  },

  // ── Check-out ─────────────────────────────────────────────────────────────────
  'reservation.checkout': {
    subject: '🏁 Location terminée — Votre avis compte',
    body: (data) => baseLayout({
      title: 'Location terminée !',
      subtitle: 'Merci de votre confiance. Un dernier geste compte beaucoup.',
      badge: { text: 'Terminée', color: '#5b21b6', bg: '#f5f3ff' },
      accentColor: '#8b5cf6',
      cta: { label: 'Laisser mon avis →', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
      content: [
        infoCard([
          { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
          { label: 'Statut', value: 'Terminée avec succès', icon: '✅' },
        ]),
        divider(),
        p('Les avis sont <strong>le moteur de la confiance</strong> sur AutoLoc. 30 secondes de votre part aident des dizaines de locataires à choisir le bon véhicule.', 'text-align:center;font-weight:500;'),
      ].join(''),
    }),
  },

  // ── Avis reçu ─────────────────────────────────────────────────────────────────
  'avis.recu': {
    subject: '⭐ Nouvel avis — Voyez ce qu\'on dit de vous',
    body: (data) => baseLayout({
      title: 'Vous avez reçu un avis',
      subtitle: 'Un membre de la communauté vous a évalué.',
      badge: { text: 'Avis reçu', color: '#92400e', bg: '#fffbeb' },
      accentColor: '#f59e0b',
      cta: { label: 'Voir l\'avis', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
      content: [
        infoCard([
          { label: 'Note', value: `${'⭐'.repeat(Number(data.note ?? 0))} (${data.note}/5)`, icon: '⭐' },
          ...(data.commentaire
            ? [{ label: 'Commentaire', value: `"${String(data.commentaire)}"`, icon: '💬' }]
            : []),
        ]),
        alertBox('Un bon score sur AutoLoc attire <strong>plus de réservations</strong>. Continuez comme ça !', 'info'),
      ].join(''),
    }),
  },

  // ── KYC vérifié ──────────────────────────────────────────────────────────────
  'kyc.verified': {
    subject: '✅ Identité vérifiée — Vous pouvez louer dès maintenant',
    body: (data) => baseLayout({
      title: `Vous êtes vérifié${data.prenom ? `, ${data.prenom}` : ''} !`,
      subtitle: 'Accès complet débloqué. Louez ou publiez dès maintenant.',
      badge: { text: 'Vérifié ✓', color: EMERALD_DARK, bg: EMERALD_BG },
      cta: { label: 'Explorer les véhicules →', href: `${FRONTEND_URL}/explorer` },
      content: [
        infoCard([
          { label: 'Louer un véhicule', value: 'Accès immédiat à toutes les annonces', icon: '🔑' },
          { label: 'Publier votre véhicule', value: 'Commencez à générer des revenus', icon: '🚗' },
          { label: 'Wallet propriétaire', value: 'Encaissez et retirez vos gains', icon: '💰' },
        ]),
      ].join(''),
    }),
  },

  // ── KYC rejeté ───────────────────────────────────────────────────────────────
  'kyc.rejected': {
    subject: '⚠️ Vérification d\'identité — Action requise',
    body: (data) => baseLayout({
      title: 'Vérification non validée',
      subtitle: 'Des corrections sont nécessaires.',
      badge: { text: 'À corriger', color: '#92400e', bg: '#fffbeb' },
      accentColor: '#f59e0b',
      cta: { label: 'Soumettre à nouveau', href: `${FRONTEND_URL}/dashboard/settings` },
      content: [
        p('Votre dossier de vérification d\'identité n\'a pas pu être validé.'),
        ...(data.raison
          ? [infoCard([{ label: 'Motif du refus', value: String(data.raison), icon: '⚠️' }])]
          : []),
        p('Pour soumettre à nouveau votre dossier, assurez-vous que :'),
        `<ul style="margin:0 0 16px;padding-left:20px;color:#374151;font-size:15px;line-height:2;">
                  <li>Les photos sont <strong>lisibles et nettes</strong></li>
                  <li>Les documents sont <strong>en cours de validité</strong></li>
                  <li>Les informations correspondent à <strong>votre profil</strong></li>
                </ul>`,
        p('Pour toute question, contactez notre support à <a href="mailto:support@autoloc.sn" style="color:' + EMERALD + ';font-weight:600;">support@autoloc.sn</a>'),
      ].join(''),
    }),
  },

  // ── Litige ouvert ────────────────────────────────────────────────────────────
  'litige.ouvert': {
    subject: '🚨 Un litige a été ouvert sur votre réservation',
    body: (data) => baseLayout({
      title: 'Litige en cours',
      subtitle: 'Notre équipe prend en charge votre dossier.',
      badge: { text: 'Litige ouvert', color: '#991b1b', bg: '#fef2f2' },
      accentColor: '#ef4444',
      cta: { label: 'Voir ma réservation', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
      content: [
        p('Un litige a été ouvert concernant votre réservation. Notre équipe va examiner le dossier dans les plus brefs délais.'),
        infoCard([
          { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
          { label: 'Statut', value: 'En cours d\'examen', icon: '🔍' },
        ]),
        alertBox('Notre équipe a été notifiée et traitera votre litige sous <strong>48 heures ouvrables</strong>. Vous serez informé de la résolution par email.', 'info'),
      ].join(''),
    }),
  },

  // ── Litige résolu ─────────────────────────────────────────────────────────────
  'litige.resolu': {
    subject: '✅ Litige résolu',
    body: (data) => baseLayout({
      title: 'Litige résolu',
      subtitle: 'Notre équipe a traité votre dossier.',
      badge: { text: 'Résolu', color: EMERALD_DARK, bg: EMERALD_BG },
      cta: { label: 'Voir ma réservation', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
      content: [
        p('Le litige concernant votre réservation a été résolu par notre équipe.'),
        infoCard([
          { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
          ...(data.resolution
            ? [{ label: 'Résolution', value: String(data.resolution), icon: '⚖️' }]
            : []),
        ]),
        p('Merci de votre patience. Si vous avez des questions sur cette décision, contactez notre support.'),
      ].join(''),
    }),
  },
  // ── Wallet crédité ───────────────────────────────────────────────────────────
  'wallet.credited': {
    subject: '💰 Votre argent est disponible — Retirez quand vous voulez',
    body: (data) => baseLayout({
      title: 'Revenu crédité !',
      subtitle: 'Le check-in est validé. Vos fonds sont disponibles maintenant.',
      badge: { text: 'Wallet crédité', color: EMERALD_DARK, bg: EMERALD_BG },
      cta: { label: 'Voir mon wallet →', href: `${FRONTEND_URL}/login?next=${encodeURIComponent('/dashboard/owner/wallet')}&role=PROPRIETAIRE` },
      content: [
        infoCard([
          { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
          ...(data.montant ? [{ label: 'Montant crédité', value: `${Number(data.montant).toLocaleString('fr-FR')} FCFA`, icon: '💰' }] : []),
          { label: 'Disponibilité', value: 'Immédiate', icon: '✅' },
        ]),
        alertBox('Vos fonds sont <strong>disponibles immédiatement</strong>. Effectuez un retrait vers votre compte Wave ou Orange Money depuis votre espace propriétaire.', 'info'),
      ].join(''),
    }),
  },

  // ── Rappel check-out ───────────────────────────────────────────────────────────
  'reservation.checkout.reminder': {
    subject: '🏁 Votre location se termine bientôt',
    body: (data) => baseLayout({
      title: 'Rappel Check-out',
      subtitle: 'Préparez-vous à rendre le véhicule.',
      badge: { text: 'Check-out', color: '#5b21b6', bg: '#f5f3ff' },
      accentColor: '#8b5cf6',
      cta: { label: 'Voir ma réservation', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
      content: [
        infoCard([
          { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
        ]),
        alertBox('N\'oubliez pas de faire le check-out sur l\'application avant de rendre le véhicule.', 'info'),
      ].join(''),
    }),
  },

  // ── Demande d'avis ───────────────────────────────────────────────────────────────
  'avis.request': {
    subject: '⭐ Donnez votre avis sur votre trajet',
    body: (data) => baseLayout({
      title: 'Votre avis compte',
      subtitle: 'Aidez la communauté en partageant votre expérience.',
      badge: { text: 'Avis', color: '#92400e', bg: '#fffbeb' },
      accentColor: '#f59e0b',
      cta: { label: 'Laisser un avis →', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
      content: [
        p('Comment s\'est passé votre trajet ? Votre avis aide les autres utilisateurs à faire le bon choix.'),
      ].join(''),
    }),
  },

  // ── Code de vérification ───────────────────────────────────────────────────────
  'verification.code': {
    subject: '🔐 Votre code de vérification AutoLoc',
    body: (data) => baseLayout({
      title: 'Code de vérification',
      subtitle: 'Entrez ce code pour confirmer votre identité.',
      badge: { text: 'Sécurité', color: '#059669', bg: '#ecfdf5' },
      accentColor: '#10b981',
      content: [
        infoCard([
          { label: 'Code', value: String(data.code ?? ''), icon: '🔐' },
        ]),
        alertBox('Ce code expire dans 5 minutes. Ne le partagez avec personne.', 'warning'),
      ].join(''),
    }),
  },

  'auth.login_otp': {
    subject: '🔐 Votre code de connexion AutoLoc',
    body: (data) => baseLayout({
      title: 'Code de connexion',
      subtitle: 'Utilisez ce code pour accéder à votre compte.',
      badge: { text: 'Connexion', color: '#059669', bg: '#ecfdf5' },
      accentColor: '#10b981',
      content: [
        infoCard([
          { label: 'Code OTP', value: String(data.otp ?? data.code ?? ''), icon: '🔑' },
        ]),
        alertBox('Ce code est strictement personnel. Ne le communiquez jamais.', 'warning'),
      ].join(''),
    }),
  },

  'user.status_changed': {
    subject: '🔔 Mise à jour de votre compte AutoLoc',
    body: (data) => baseLayout({
      title: 'Statut de votre compte',
      subtitle: 'Une modification a été apportée à votre accès.',
      badge: { text: 'Information', color: '#111827', bg: '#f3f4f6' },
      content: [
        p(`Bonjour${data.prenom ? ` ${data.prenom}` : ''},`),
        p(`Votre compte AutoLoc a été <strong>${data.statusText}</strong>.`),
        data.untilText ? p(`Cette mesure est effective <strong>${data.untilText}</strong>.`) : '',
        data.raison ? alertBox(`Raison : ${data.raison}`, 'info') : '',
        p('Pour toute question, contactez notre support.'),
      ].join(''),
    }),
  },

  'vehicle.validated': {
    subject: '🎉 Votre véhicule est en ligne !',
    body: (data) => baseLayout({
      title: 'Véhicule validé',
      subtitle: 'Votre annonce est maintenant visible par tous.',
      badge: { text: 'En ligne', color: EMERALD_DARK, bg: EMERALD_BG },
      content: [
        p(`Bonjour${data.prenom ? ` ${data.prenom}` : ''},`),
        p(`Bonne nouvelle ! Votre véhicule <strong>${data.vehicule}</strong> a été validé par notre équipe.`),
        p('Il est maintenant disponible à la location sur AutoLoc.'),
        alertBox('Pensez à garder votre calendrier à jour pour éviter les annulations.', 'info'),
      ].join(''),
    }),
  },

  'vehicle.suspended': {
    subject: '⚠️ Votre annonce a été suspendue',
    body: (data) => baseLayout({
      title: 'Annonce suspendue',
      subtitle: 'Votre véhicule n\'est plus visible temporairement.',
      badge: { text: 'Suspendu', color: '#991b1b', bg: '#fef2f2' },
      content: [
        p(`Bonjour${data.prenom ? ` ${data.prenom}` : ''},`),
        p(`Votre véhicule <strong>${data.vehicule}</strong> a été suspendu sur AutoLoc.`),
        data.raison ? alertBox(`Raison : ${data.raison}`, 'warning') : '',
        p('Contactez notre support pour plus d\'informations.'),
      ].join(''),
    }),
  },

  'vehicle.featured': {
    subject: '🌟 Votre véhicule est mis en avant !',
    body: (data) => baseLayout({
      title: 'Mise en avant activée',
      subtitle: 'Boostez vos réservations avec une visibilité prioritaire.',
      badge: { text: 'Premium', color: '#92400e', bg: '#fffbeb' },
      content: [
        p(`Bonjour${data.prenom ? ` ${data.prenom}` : ''},`),
        p(`Félicitations ! Votre véhicule <strong>${data.vehicule}</strong> est maintenant mis en avant sur AutoLoc.`),
        p('Il apparaîtra en priorité dans les résultats de recherche.'),
      ].join(''),
    }),
  },

  // ── Admin Notifications ──────────────────────────────────────────────────────

  'admin.withdrawal.requested': {
    subject: '[AutoLoc Admin] Demande de retrait',
    body: (data) => baseLayout({
      title: '💸 Nouvelle demande de retrait',
      subtitle: 'Action requise pour traiter le retrait',
      badge: { text: 'Admin', color: '#b91c1c', bg: '#fef2f2' },
      content: [
        infoCard([
          { label: 'Propriétaire', value: String(data.ownerName || 'N/A') },
          { label: 'Montant', value: `<strong>${Number(data.montant || 0).toLocaleString('fr-FR')} FCFA</strong>` },
          { label: 'Méthode', value: data.methode === 'WAVE' ? '🌊 Wave' : '🟠 Orange Money' },
          { label: 'Numéro', value: `<code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:12px;">${data.numeroDestinataire}</code>` },
          { label: 'Demandé le', value: String(data.requestedAt || new Date().toLocaleDateString('fr-FR')) },
        ]),
        p('<strong>Action requise :</strong>'),
        `<ol style="margin:16px 0;padding-left:24px;color:${GRAY};font-size:14px;line-height:1.7;">
          <li>Exportez le CSV des retraits en attente</li>
          <li>Uploadez sur InTouch BO (Bulk Payment)</li>
          <li>Validez sur le dashboard</li>
        </ol>`,
      ].join(''),
      cta: { label: 'Traiter les retraits', href: 'https://autoloc.sn/dashboard/admin/withdrawals' },
    }),
  },

  'admin.reservation.cancelled': {
    subject: '[AutoLoc Admin] Annulation de réservation',
    body: (data) => {
      const isLocataire = data.cancelledBy === 'LOCATAIRE';
      const isCritical = data.refundAmount && Number(data.refundAmount) > 0;

      return baseLayout({
        title: '❌ Réservation annulée',
        subtitle: `Annulé par : ${isLocataire ? 'Locataire' : 'Propriétaire'}`,
        badge: isCritical
          ? { text: 'Action requise', color: '#b91c1c', bg: '#fef2f2' }
          : { text: 'Info', color: '#1e40af', bg: '#eff6ff' },
        content: [
          infoCard([
            { label: 'Véhicule', value: String(data.vehicule || 'N/A') },
            { label: 'Dates', value: `${data.dateDebut ? new Date(String(data.dateDebut)).toLocaleDateString('fr-FR') : 'N/A'} → ${data.dateFin ? new Date(String(data.dateFin)).toLocaleDateString('fr-FR') : 'N/A'}` },
            { label: 'Annulé par', value: `<strong>${isLocataire ? 'LOCATAIRE' : 'PROPRIETAIRE'}</strong> (${data.cancelledByName || 'N/A'})` },
            { label: 'Raison', value: String(data.raison || 'Non précisée') },
            { label: 'Annulé le', value: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
          ]),
          `<div style="margin:24px 0;padding:16px;background:#f8fafc;border-left:4px solid ${EMERALD};border-radius:8px;">
            <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:${GRAY};">💰 Politique appliquée</p>
            <table style="width:100%;border-collapse:collapse;">
              <tr style="border-bottom:1px solid ${BORDER};">
                <td style="padding:8px 0;font-size:13px;color:${GRAY};">Remboursement locataire</td>
                <td style="padding:8px 0;font-size:14px;font-weight:700;text-align:right;color:${DARK};">
                  ${data.refundPercentage || 0}% (${Number(data.refundAmount || 0).toLocaleString('fr-FR')} FCFA)
                </td>
              </tr>
              <tr style="border-bottom:1px solid ${BORDER};">
                <td style="padding:8px 0;font-size:13px;color:${GRAY};">Commission retenue</td>
                <td style="padding:8px 0;font-size:14px;font-weight:700;text-align:right;color:${DARK};">
                  ${Number(data.commissionRetained || 0).toLocaleString('fr-FR')} FCFA
                </td>
              </tr>
              ${!isLocataire ? `<tr>
                <td style="padding:8px 0;font-size:13px;color:${GRAY};">Pénalité propriétaire</td>
                <td style="padding:8px 0;font-size:14px;font-weight:700;text-align:right;color:#dc2626;">
                  ${Number(data.ownerPenaltyAmount || 0).toLocaleString('fr-FR')} FCFA (${data.ownerPenaltyPercentage || 0}%)
                </td>
              </tr>` : ''}
            </table>
          </div>`,
          isCritical
            ? p(`<strong>⚠️ Action requise :</strong> Rembourser <strong>${Number(data.refundAmount).toLocaleString('fr-FR')} FCFA</strong> au locataire via InTouch.`)
            : '',
        ].join(''),
        cta: { label: 'Voir la réservation', href: `https://autoloc.sn/dashboard/admin/reservations/${data.reservationId}` },
      });
    },
  },

  'admin.refund.processed': {
    subject: '[AutoLoc Admin] Remboursement effectué',
    body: (data) => baseLayout({
      title: '✅ Remboursement traité',
      subtitle: `Locataire remboursé via ${data.fournisseur || 'InTouch'}`,
      badge: { text: 'Confirmé', color: '#047857', bg: '#d1fae5' },
      content: [
        infoCard([
          { label: 'Locataire', value: `${data.locataireNom || 'N/A'}<br/><span style="font-size:12px;color:#64748b;">${data.locataireEmail || ''}</span>` },
          { label: 'Montant remboursé', value: `<strong style="color:#047857;">${data.montant || 0} FCFA</strong>` },
          { label: 'Méthode', value: String(data.fournisseur || 'InTouch') },
          { label: 'Véhicule', value: String(data.vehicule || 'N/A') },
          { label: 'Réservation', value: String(data.reservationId || 'N/A') },
          { label: 'Traité le', value: String(data.processedAt || new Date().toLocaleDateString('fr-FR')) },
        ]),
        p(`✅ Le remboursement a été marqué comme effectué dans le système. Le locataire peut maintenant voir le statut "Remboursé" sur son contrat.`),
      ].join(''),
      cta: { label: 'Voir les remboursements', href: 'https://autoloc.sn/dashboard/admin/refunds' },
    }),
  },
};
