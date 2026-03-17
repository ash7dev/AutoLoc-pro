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
        subject: '🎉 Bienvenue sur AutoLoc !',
        body: (data) => baseLayout({
            title: `Bienvenue${data.prenom ? `, ${data.prenom}` : ''} !`,
            subtitle: 'Votre compte est prêt. Commencez à explorer.',
            badge: { text: 'Nouveau membre', color: EMERALD, bg: EMERALD_BG },
            cta: { label: 'Explorer les véhicules', href: `${FRONTEND_URL}/explorer` },
            content: [
                p('Nous sommes ravis de vous accueillir sur <strong>AutoLoc</strong>, la plateforme de location de véhicules entre particuliers au Sénégal.'),
                infoCard([
                    { label: 'Prochaine étape', value: 'Vérifiez votre identité (KYC)', icon: '🪪' },
                    { label: 'Après vérification', value: 'Louez ou publiez un véhicule', icon: '🚗' },
                ]),
                p('La vérification d\'identité prend moins de 2 minutes et vous ouvre l\'accès complet à la plateforme.'),
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
        subject: '✅ Paiement reçu — Votre location est en bonne voie',
        body: (data) => baseLayout({
            title: 'Paiement confirmé !',
            subtitle: 'Le propriétaire va maintenant confirmer votre réservation.',
            badge: { text: 'Paiement reçu', color: EMERALD_DARK, bg: EMERALD_BG },
            cta: { label: 'Voir ma réservation', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
            content: [
                p('Votre paiement a bien été reçu et enregistré. Le propriétaire dispose de <strong>24 heures</strong> pour confirmer votre réservation.'),
                infoCard([
                    { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
                    { label: 'Statut', value: 'Paiement confirmé — En attente du propriétaire', icon: '✅' },
                ]),
                p('Votre contrat de location est en cours de génération. Vous pourrez le consulter depuis votre espace réservation.'),
            ].join(''),
        }),
    },

    // ── Réservation confirmée ────────────────────────────────────────────────────

    'reservation.confirmed': {
        subject: '🎉 Bonne nouvelle — Votre réservation est confirmée !',
        body: (data) => baseLayout({
            title: 'Réservation confirmée !',
            subtitle: 'Le propriétaire a accepté votre demande.',
            badge: { text: 'Confirmée', color: EMERALD_DARK, bg: EMERALD_BG },
            cta: { label: 'Voir ma réservation', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
            content: [
                p(`Bonjour${data.locatairePrenom ? ` <strong>${data.locatairePrenom}</strong>` : ''},`),
                p('Super nouvelle ! Le propriétaire a confirmé votre réservation. Votre location est officielle.'),
                infoCard([
                    { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
                    { label: 'Prochaine étape', value: 'Effectuer le check-in le jour J', icon: '🔑' },
                ]),
                alertBox('Le check-in doit être effectué par les deux parties le jour du début de la location pour officialiser la remise du véhicule.', 'info'),
            ].join(''),
        }),
    },

    // ── Réservation annulée ──────────────────────────────────────────────────────

    'reservation.cancelled': {
        subject: '❌ Réservation annulée',
        body: (data) => baseLayout({
            title: 'Réservation annulée',
            subtitle: 'Votre réservation a été annulée.',
            badge: { text: 'Annulée', color: '#991b1b', bg: '#fef2f2' },
            accentColor: '#ef4444',
            cta: { label: 'Explorer d\'autres véhicules', href: `${FRONTEND_URL}/explorer` },
            content: [
                p(`Bonjour${data.locatairePrenom ? ` <strong>${data.locatairePrenom}</strong>` : ''},`),
                p(`Votre réservation ${data.raison ? `a été annulée pour le motif suivant : <strong>${data.raison}</strong>` : 'a été annulée'}.`),
                infoCard([
                    { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
                    { label: 'Annulée par', value: data.cancelledBy === 'PROPRIETAIRE' ? 'Le propriétaire' : 'Le locataire', icon: '👤' },
                    ...(data.refundAmount
                        ? [{ label: 'Remboursement', value: `${data.refundAmount} FCFA`, icon: '💸' }]
                        : []),
                ]),
                data.refundAmount
                    ? alertBox('Votre remboursement sera traité dans un délai de <strong>3 à 5 jours ouvrables</strong> selon votre moyen de paiement.', 'info')
                    : '',
                p('Vous pouvez dès maintenant explorer d\'autres véhicules disponibles sur AutoLoc.'),
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
        subject: '📅 Rappel — Votre location commence demain',
        body: (data) => baseLayout({
            title: 'Votre location commence demain',
            subtitle: 'Préparez-vous pour le check-in.',
            badge: { text: 'Rappel', color: '#1e40af', bg: '#eff6ff' },
            accentColor: '#3b82f6',
            cta: { label: 'Voir ma réservation', href: `${FRONTEND_URL}/dashboard/reservations` },
            content: [
                p(`Bonjour <strong>${String(data.prenom ?? '')}</strong>,`),
                p('Votre location commence <strong>demain</strong>. Pensez à vous retrouver avec l\'autre partie pour effectuer le check-in.'),
                infoCard([
                    { label: 'Date de début', value: String(data.dateDebut ?? ''), icon: '📅' },
                ]),
                p('Le check-in consiste à confirmer mutuellement la remise du véhicule depuis l\'application AutoLoc. Les deux parties doivent le faire pour démarrer la location.'),
            ].join(''),
        }),
    },

    // ── Rappel check-in jour J ────────────────────────────────────────────────────

    'reservation.checkin.reminder_jour': {
        subject: '⚠️ Urgent — Check-in non effectué aujourd\'hui',
        body: (data) => baseLayout({
            title: 'Check-in non effectué',
            subtitle: 'Action requise avant minuit.',
            badge: { text: 'Urgent', color: '#991b1b', bg: '#fef2f2' },
            accentColor: '#ef4444',
            cta: { label: 'Effectuer le check-in maintenant', href: `${FRONTEND_URL}/dashboard/reservations` },
            content: [
                p(`Bonjour <strong>${String(data.prenom ?? '')}</strong>,`),
                p('Votre location a commencé aujourd\'hui mais le check-in n\'a pas encore été effectué.'),
                infoCard([
                    { label: 'Date de début', value: String(data.dateDebut ?? ''), icon: '📅' },
                    { label: 'Délai limite', value: 'Aujourd\'hui avant minuit', icon: '⏰' },
                ]),
                alertBox('⚠️ Si le check-in n\'est pas effectué avant minuit, la réservation sera <strong>automatiquement annulée</strong>.', 'error'),
            ].join(''),
        }),
    },

    // ── Check-out ─────────────────────────────────────────────────────────────────

    'reservation.checkout': {
        subject: '🏁 Location terminée — Merci d\'avoir utilisé AutoLoc',
        body: (data) => baseLayout({
            title: 'Location terminée !',
            subtitle: 'Le check-out a été effectué avec succès.',
            badge: { text: 'Terminée', color: '#5b21b6', bg: '#f5f3ff' },
            accentColor: '#8b5cf6',
            cta: { label: 'Laisser un avis', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
            content: [
                p(`Bonjour${data.locatairePrenom ? ` <strong>${data.locatairePrenom}</strong>` : ''},`),
                p('La location s\'est terminée avec succès. Merci d\'avoir utilisé <strong>AutoLoc</strong> !'),
                infoCard([
                    { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
                    { label: 'Statut', value: 'Terminée', icon: '✅' },
                ]),
                divider(),
                p('Votre avis est précieux pour la communauté AutoLoc. Prenez 30 secondes pour noter votre expérience — cela aide les autres utilisateurs à faire de bons choix.', 'text-align:center;'),
            ].join(''),
        }),
    },

    // ── Avis reçu ─────────────────────────────────────────────────────────────────

    'avis.recu': {
        subject: '⭐ Vous avez reçu un nouvel avis',
        body: (data) => baseLayout({
            title: 'Nouvel avis reçu',
            subtitle: 'Un membre de la communauté vous a évalué.',
            badge: { text: 'Avis', color: '#92400e', bg: '#fffbeb' },
            accentColor: '#f59e0b',
            cta: { label: 'Voir mon profil', href: `${FRONTEND_URL}/dashboard` },
            content: [
                p('Vous venez de recevoir un avis sur AutoLoc.'),
                infoCard([
                    { label: 'Note', value: `${'⭐'.repeat(Number(data.note ?? 0))} (${data.note}/5)`, icon: '⭐' },
                    ...(data.commentaire
                        ? [{ label: 'Commentaire', value: `"${String(data.commentaire)}"`, icon: '💬' }]
                        : []),
                ]),
                p('Les avis contribuent à construire la confiance au sein de la communauté AutoLoc. Continuez à offrir une excellente expérience !'),
            ].join(''),
        }),
    },

    // ── KYC vérifié ──────────────────────────────────────────────────────────────

    'kyc.verified': {
        subject: '✅ Identité vérifiée — Accès complet débloqué',
        body: (data) => baseLayout({
            title: 'Identité vérifiée !',
            subtitle: 'Votre compte est maintenant pleinement actif.',
            badge: { text: 'Vérifié ✓', color: EMERALD_DARK, bg: EMERALD_BG },
            cta: { label: 'Commencer sur AutoLoc', href: `${FRONTEND_URL}/explorer` },
            content: [
                p(`Bonjour${data.prenom ? ` <strong>${data.prenom}</strong>` : ''},`),
                p('Votre vérification d\'identité a été <strong>validée avec succès</strong>. Votre compte est maintenant pleinement actif.'),
                infoCard([
                    { label: 'Vous pouvez maintenant', value: 'Louer des véhicules', icon: '🔑' },
                    { label: '', value: 'Publier vos véhicules', icon: '🚗' },
                    { label: '', value: 'Accéder au wallet propriétaire', icon: '💰' },
                ]),
                p('Bienvenue dans la communauté AutoLoc !'),
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
        subject: '💰 Votre revenu a été crédité sur AutoLoc',
        body: (data) => baseLayout({
            title: 'Revenu disponible !',
            subtitle: 'Votre wallet vient d\'être crédité.',
            badge: { text: 'Wallet crédité', color: EMERALD_DARK, bg: EMERALD_BG },
            cta: { label: 'Voir mon wallet', href: `${FRONTEND_URL}/dashboard/owner/wallet` },
            content: [
                p(`Bonjour <strong>${String(data.proprietairePrenom ?? '')}</strong>,`),
                p('Le check-in de votre location a été finalisé. Votre revenu a été <strong>crédité sur votre wallet AutoLoc</strong>.'),
                infoCard([
                    { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`, icon: '📋' },
                    { label: 'Statut', value: 'Fonds disponibles', icon: '💰' },
                ]),
                divider(),
                p('Depuis votre espace propriétaire, vous pouvez consulter votre solde et effectuer une demande de retrait à tout moment.', 'text-align:center;color:' + GRAY + ';font-size:14px;'),
            ].join(''),
        }),
    },
};
