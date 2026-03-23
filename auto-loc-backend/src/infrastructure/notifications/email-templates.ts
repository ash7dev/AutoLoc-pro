// ── Email Templates ─────────────────────────────────────────────────────────────
// Design premium — charte AutoLoc : noir profond · vert émeraude · blanc pur
// Compatible tous clients mail (inline styles, table layout, pas de CSS custom props)

export type NotificationType =
    | 'reservation.created'
    | 'reservation.confirmed'
    | 'reservation.paid'
    | 'reservation.cancelled'
    | 'reservation.checkin'
    | 'reservation.checkin.owner_confirmed'
    | 'reservation.checkin.tenant_confirmed'
    | 'reservation.checkin.reminder_veille'
    | 'reservation.checkin.reminder_jour'
    | 'reservation.checkout'
    | 'avis.recu'
    | 'kyc.verified'
    | 'kyc.rejected'
    | 'litige.ouvert'
    | 'litige.resolu'
    | 'user.welcome'
    | 'wallet.credited';

interface TemplateConfig {
    subject: string;
    body: (data: Record<string, unknown>) => string;
}

// ── Brand tokens ────────────────────────────────────────────────────────────────

const EMERALD      = '#10b981';
const EMERALD_DARK = '#059669';
const EMERALD_BG   = '#ecfdf5';
const DARK         = '#111827';
const GRAY         = '#6b7280';
const LIGHT_GRAY   = '#f9fafb';
const BORDER       = '#e5e7eb';
const WHITE        = '#ffffff';
const FRONTEND_URL    = 'https://autoloc.sn';
const LOGO_URL        = `${FRONTEND_URL}/logoAutoLoc.jpg`;

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

                  <!-- Logo centré dans panel glass -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"
                    style="background:linear-gradient(135deg,rgba(255,255,255,0.04) 0%,rgba(16,185,129,0.06) 100%);
                      border:1px solid rgba(16,185,129,0.18);border-radius:16px;padding:28px 24px;">
                    <tr>
                      <td align="center">
                        <img src="${LOGO_URL}" alt="AutoLoc" width="205" height="82"
                          style="display:block;object-fit:contain;max-width:205px;">
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
                      ? `<p style="margin:10px 0 0;font-size:14px;color:#94a3b8;line-height:1.6;font-weight:400;">${opts.subtitle}</p>`
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
        error:   { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' },
        info:    { bg: EMERALD_BG, border: EMERALD,  text: '#065f46' },
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
            cta: { label: 'Vérifier mon identité →', href: `${FRONTEND_URL}/dashboard/owner/kyc` },
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

    // ── Réservation confirmée ────────────────────────────────────────────────────

    'reservation.confirmed': {
        subject: '🎉 C\'est confirmé — Préparez-vous !',
        body: (data) => baseLayout({
            title: `C'est confirmé${data.locatairePrenom ? `, ${data.locatairePrenom}` : ''} !`,
            subtitle: 'Le propriétaire a validé. Votre location est officielle.',
            badge: { text: 'Confirmée', color: EMERALD_DARK, bg: EMERALD_BG },
            cta: { label: 'Voir les détails', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
            content: [
                infoCard([
                    { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
                    ...(data.locatairePhone ? [{ label: 'Contact propriétaire', value: String(data.locatairePhone), icon: '📞' }] : []),
                    { label: 'Prochaine étape', value: 'Check-in le jour J', icon: '🔑' },
                ]),
                alertBox('Le jour de la prise en charge, <strong>les deux parties doivent confirmer le check-in</strong> sur AutoLoc pour démarrer officiellement la location et libérer le paiement.', 'info'),
            ].join(''),
        }),
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
            cta: { label: 'Voir mon wallet →', href: `${FRONTEND_URL}/dashboard/owner/wallet` },
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
};
