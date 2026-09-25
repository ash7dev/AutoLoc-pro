// ── Email Templates ─────────────────────────────────────────────────────────────
// Design premium — charte AutoLoc : vert forêt · champagne · blanc pur
// Compatible tous clients mail (inline styles, table layout, pas de CSS custom props,
// pas de police externe : Georgia/serif de repli pour les titres)

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
  | 'host.fleet_suspended'
  | 'host.fleet_activated'
  | 'admin.withdrawal.requested'
  | 'admin.reservation.cancelled'
  | 'admin.refund.processed';

interface TemplateConfig {
  subject: string;
  body: (data: Record<string, unknown>) => string;
}

type BadgeTone = 'forest' | 'gold' | 'amber' | 'rose' | 'blue' | 'violet' | 'neutral';

// ── Jetons de marque ──────────────────────────────────────────────────────────────

const FOREST = '#0A3D2E';
const FOREST_DARK = '#062A1F';
const FOREST_SOFT = '#EAF1EC'; // fond très clair, teinté forêt
const CHAMPAGNE = '#F1DFB6';
const GOLD = '#B27C2D';
const DARK = '#111827';
const GRAY = '#64748B';
const LIGHT_GRAY = '#F7F8F5';
const BORDER = '#E7E9E4';
const WHITE = '#ffffff';
const FRONTEND_URL = 'https://autoloc.sn';
const LOGO_URL = `${FRONTEND_URL}/logoAutoLoc.jpg`;
const FOOTER_LOGO_URL = `${FRONTEND_URL}/footerlogo.jpg`;

/** Titres : serif de repli seulement — aucune police externe ne se charge de façon fiable dans les clients mail */
const SERIF = "Georgia, 'Times New Roman', Times, serif";
const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

const BADGE_TONES: Record<BadgeTone, { bg: string; text: string; border: string }> = {
  forest: { bg: FOREST_SOFT, text: FOREST, border: `${FOREST}33` },
  gold: { bg: '#FBF1DE', text: '#8A5A1E', border: `${GOLD}40` },
  amber: { bg: '#FFFBEB', text: '#92400E', border: '#F59E0B40' },
  rose: { bg: '#FEF2F2', text: '#991B1B', border: '#EF444440' },
  blue: { bg: '#EFF6FF', text: '#1E40AF', border: '#3B82F640' },
  violet: { bg: '#F5F3FF', text: '#5B21B6', border: '#8B5CF640' },
  neutral: { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' },
};

// ── Mise en page de base ───────────────────────────────────────────────────────────

function baseLayout(opts: {
  title: string;
  subtitle?: string;
  badge?: { text: string; tone?: BadgeTone };
  content: string;
  cta?: { label: string; href: string };
}): string {
  const tone = BADGE_TONES[opts.badge?.tone ?? 'forest'];

  const badge = opts.badge
    ? `<span style="display:inline-block;background:${tone.bg};color:${tone.text};
          font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;
          padding:5px 14px;border-radius:100px;border:1px solid ${tone.border};">
          ${opts.badge.text}
        </span>`
    : '';

  const ctaBlock = opts.cta
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
         <tr>
           <td align="center">
             <a href="${opts.cta.href}"
               style="display:inline-block;background:${FOREST};color:${CHAMPAGNE};
                 font-family:${SANS};font-size:14px;font-weight:700;letter-spacing:0.01em;
                 text-decoration:none;padding:15px 34px;border-radius:100px;">
               ${opts.cta.label}
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
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background:${LIGHT_GRAY};font-family:${SANS};-webkit-font-smoothing:antialiased;">

  <!-- Texte de prévisualisation, invisible dans le corps du mail -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${opts.subtitle ?? opts.title}
    &#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${LIGHT_GRAY};padding:40px 16px;">
    <tr><td align="center">

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
        style="max-width:560px;background:${WHITE};border-radius:24px;overflow:hidden;
          border:1px solid ${BORDER};">

        <!-- ══ EN-TÊTE ══ -->
        <tr>
          <td style="background:${FOREST};padding:36px 40px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="padding-bottom:22px;">
                  <img src="${FOOTER_LOGO_URL}" alt="AutoLoc" width="132" height="auto"
                    style="display:block;max-width:132px;border:0;">
                </td>
              </tr>
              <tr>
                <td style="border-top:1px solid rgba(241,223,182,0.18);padding-top:22px;">
                  ${badge ? `<div style="margin-bottom:14px;">${badge}</div>` : ''}
                  <h1 style="margin:0;font-family:${SERIF};font-size:26px;font-weight:400;
                    color:${WHITE};letter-spacing:-0.01em;line-height:1.25;">
                    ${opts.title}
                  </h1>
                  ${opts.subtitle
      ? `<p style="margin:10px 0 0;font-family:${SANS};font-size:14px;color:rgba(241,223,182,0.85);line-height:1.6;">${opts.subtitle}</p>`
      : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ══ CORPS ══ -->
        <tr>
          <td style="padding:36px 40px;">
            ${opts.content}
            ${ctaBlock}
          </td>
        </tr>

        <!-- ══ PIED ══ -->
        <tr>
          <td style="background:${LIGHT_GRAY};border-top:1px solid ${BORDER};padding:26px 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align:middle;">
                  <p style="margin:0;font-size:12px;color:${GRAY};line-height:1.7;">
                    <strong style="color:${DARK};">AutoLoc</strong> — Location de véhicules entre particuliers au Sénégal.<br>
                    Une question&#160;? Écrivez-nous à
                    <a href="mailto:support@autoloc.sn" style="color:${FOREST};text-decoration:none;font-weight:600;">support@autoloc.sn</a>
                  </p>
                </td>
                <td align="right" style="vertical-align:middle;width:64px;">
                  <a href="${FRONTEND_URL}" style="text-decoration:none;">
                    <img src="${LOGO_URL}" alt="AutoLoc" width="52" height="auto"
                      style="display:block;max-width:52px;border:0;opacity:0.75;">
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>

      <!-- Mention légale -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
        <tr>
          <td align="center" style="padding-top:20px;">
            <p style="margin:0;font-size:11px;color:#94A3B8;line-height:1.6;">
              Vous recevez cet email car vous avez un compte AutoLoc.
              <a href="${FRONTEND_URL}/dashboard/settings/notifications" style="color:#94A3B8;">Gérer mes notifications</a>
            </p>
          </td>
        </tr>
      </table>

    </td></tr>
  </table>
</body>
</html>`.trim();
}

// ── Aides de contenu ────────────────────────────────────────────────────────────────

function p(text: string, style = ''): string {
  return `<p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;font-family:${SANS};${style}">${text}</p>`;
}

function infoCard(rows: { label: string; value: string; icon?: string }[]): string {
  const rowsHtml = rows
    .map(
      ({ label, value, icon }, i) => `
      <tr>
        <td style="padding:14px 20px;${i < rows.length - 1 ? `border-bottom:1px solid ${BORDER};` : ''}">
          <span style="display:block;font-family:${SANS};font-size:11px;font-weight:600;color:${GRAY};
            text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">
            ${icon ? icon + ' ' : ''}${label}
          </span>
          <span style="font-family:${SANS};font-size:15px;font-weight:700;color:${DARK};">${value}</span>
        </td>
      </tr>`
    )
    .join('');

  return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
        style="margin:20px 0;border-radius:16px;overflow:hidden;border:1px solid ${BORDER};background:${LIGHT_GRAY};">
        <tr><td style="background:${FOREST};height:3px;font-size:0;line-height:0;">&nbsp;</td></tr>
        ${rowsHtml}
      </table>`;
}

function alertBox(text: string, type: 'warning' | 'error' | 'info' = 'info'): string {
  const colors: Record<typeof type, { bg: string; border: string; text: string }> = {
    warning: { bg: '#FFFBEB', border: '#F59E0B', text: '#92400E' },
    error: { bg: '#FEF2F2', border: '#EF4444', text: '#991B1B' },
    info: { bg: FOREST_SOFT, border: FOREST, text: FOREST_DARK },
  };
  const c = colors[type];
  return `
      <div style="background:${c.bg};border-left:3px solid ${c.border};border-radius:0 12px 12px 0;
        padding:14px 18px;margin:20px 0;">
        <p style="margin:0;font-family:${SANS};font-size:14px;font-weight:600;color:${c.text};line-height:1.6;">${text}</p>
      </div>`;
}

function divider(): string {
  return `<div style="height:1px;background:${BORDER};margin:24px 0;"></div>`;
}

function starRating(note: number): string {
  const filled = Math.max(0, Math.min(5, Math.round(note)));
  const stars = Array.from({ length: 5 }, (_, i) =>
    i < filled ? `<span style="color:${GOLD};">★</span>` : `<span style="color:${BORDER};">★</span>`
  ).join('');
  return `<span style="font-size:16px;letter-spacing:1px;">${stars}</span> <span style="font-family:${SANS};font-size:13px;color:${GRAY};">(${note}/5)</span>`;
}

// ── Templates ────────────────────────────────────────────────────────────────────

export const EMAIL_TEMPLATES: Record<NotificationType, TemplateConfig> = {
  // ── Bienvenue ────────────────────────────────────────────────────────────────
  'user.welcome': {
    subject: 'Votre compte AutoLoc est prêt — une étape et c\u2019est parti',
    body: (data) =>
      baseLayout({
        title: `Bienvenue${data.prenom ? `, ${data.prenom}` : ''}`,
        subtitle: 'Vérifiez votre identité en 2 minutes et accédez à tout.',
        badge: { text: 'Nouveau membre', tone: 'forest' },
        cta: {
          label: 'Vérifier mon identité',
          href: `${FRONTEND_URL}/login?next=${encodeURIComponent('/dashboard/owner/kyc')}&role=PROPRIETAIRE`,
        },
        content: [
          infoCard([
            { label: 'Étape 1, maintenant', value: 'Vérifier votre identité (2 min)' },
            { label: 'Étape 2, après validation', value: 'Louer ou publier un véhicule' },
          ]),
          alertBox(
            'La vérification est <strong>obligatoire</strong> pour louer ou publier une annonce. Elle protège toute la communauté AutoLoc.',
            'info'
          ),
        ].join(''),
      }),
  },

  // ── Réservation créée ────────────────────────────────────────────────────────
  'reservation.created': {
    subject: 'Votre réservation est en attente de paiement',
    body: (data) =>
      baseLayout({
        title: 'Réservation initiée',
        subtitle: 'Finalisez votre paiement pour la confirmer.',
        badge: { text: 'En attente de paiement', tone: 'amber' },
        cta: { label: 'Finaliser le paiement', href: `${FRONTEND_URL}/dashboard/reservations` },
        content: [
          p(`Bonjour${data.prenom ? ` <strong>${data.prenom}</strong>` : ''},`),
          p('Votre demande de réservation a bien été enregistrée sur AutoLoc.'),
          data.vehicule
            ? infoCard([
              { label: 'Véhicule', value: String(data.vehicule) },
              {
                label: 'Réservation',
                value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}`,
              },
            ])
            : '',
          alertBox(
            'Cette réservation sera automatiquement annulée si le paiement n\u2019est pas reçu sous <strong>48 heures</strong>.',
            'warning'
          ),
        ].join(''),
      }),
  },

  // ── Paiement confirmé ────────────────────────────────────────────────────────
  'reservation.paid': {
    subject: 'Paiement reçu — on s\u2019occupe du reste',
    body: (data) =>
      baseLayout({
        title: 'Paiement reçu',
        subtitle: 'Votre argent est sécurisé. Le propriétaire a 24 h pour confirmer.',
        badge: { text: 'Paiement sécurisé', tone: 'forest' },
        cta: { label: 'Suivre ma réservation', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
        content: [
          infoCard([
            { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}` },
            { label: 'Statut', value: 'En attente de confirmation du propriétaire' },
          ]),
          alertBox(
            'Votre paiement est <strong>bloqué en séquestre</strong> et ne sera libéré qu\u2019après confirmation du check-in. Si le propriétaire ne confirme pas sous 24 h, vous êtes <strong>remboursé automatiquement</strong>.',
            'info'
          ),
        ].join(''),
      }),
  },

  // ── Paiement confirmé (Propriétaire) ───────────────────────────────────────
  'reservation.paid.owner': {
    subject: 'Nouvelle réservation payée — action requise sous 24 h',
    body: (data) => {
      const isDeposit =
        data.modePaiement === 'ACOMPTE_SOLDE_CHECKIN' || Number(data.montantSoldeCheckin ?? 0) > 0;
      const soldeStr = data.montantSoldeCheckin
        ? `${Number(data.montantSoldeCheckin).toLocaleString('fr-FR')} FCFA`
        : null;

      return baseLayout({
        title: 'Votre véhicule est réservé',
        subtitle: 'Le paiement est sécurisé. Confirmez pour finaliser la location.',
        badge: { text: 'Nouvelle réservation', tone: 'forest' },
        cta: {
          label: 'Confirmer la réservation',
          href: `${FRONTEND_URL}/login?next=${encodeURIComponent(
            `/dashboard/owner/reservations/${data.reservationId ?? ''}`
          )}&role=PROPRIETAIRE`,
        },
        content: [
          infoCard([
            { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}` },
            { label: 'Modalité de paiement', value: isDeposit ? 'Acompte de 30\u00a0% en ligne' : 'Paiement intégral en ligne' },
            ...(isDeposit && soldeStr
              ? [{ label: 'Solde à percevoir au check-in', value: soldeStr }]
              : []),
            { label: 'Délai de réponse', value: '24 heures' },
          ]),
          alertBox(
            '<strong>Important&#160;:</strong> vous avez <strong>24 heures</strong> pour confirmer. Passé ce délai, la réservation est annulée et le locataire remboursé automatiquement.',
            'warning'
          ),
          ...(isDeposit && soldeStr
            ? [
              alertBox(
                `<strong>Rappel acompte&#160;:</strong> le locataire a réglé 30\u00a0% en ligne. N\u2019oubliez pas de percevoir le solde de <strong>${soldeStr}</strong> lors de la remise des clés, puis de confirmer le check-in dans l\u2019application.`,
                'info'
              ),
            ]
            : []),
          divider(),
          p('<strong>Prochaines étapes\u00a0:</strong>'),
          `<ol style="margin:0 0 16px;padding-left:20px;color:#374151;font-family:${SANS};font-size:15px;line-height:1.8;">
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
    subject: 'C\u2019est confirmé — préparez-vous',
    body: (data) => {
      const isDeposit =
        data.modePaiement === 'ACOMPTE_SOLDE_CHECKIN' || Number(data.montantSoldeCheckin ?? 0) > 0;
      const soldeStr = data.montantSoldeCheckin
        ? `${Number(data.montantSoldeCheckin).toLocaleString('fr-FR')} FCFA`
        : null;

      return baseLayout({
        title: `C\u2019est confirmé${data.locatairePrenom ? `, ${data.locatairePrenom}` : ''}`,
        subtitle: 'Le propriétaire a validé. Votre location est officielle.',
        badge: { text: 'Confirmée', tone: 'forest' },
        cta: { label: 'Voir les détails', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
        content: [
          infoCard([
            { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}` },
            { label: 'Modalité de paiement', value: isDeposit ? 'Acompte de 30\u00a0% réglé' : 'Réglé intégralement en ligne' },
            ...(isDeposit && soldeStr
              ? [{ label: 'Solde restant dû au check-in', value: soldeStr }]
              : []),
            ...(data.locatairePhone
              ? [{ label: 'Contact propriétaire', value: String(data.locatairePhone) }]
              : []),
            { label: 'Prochaine étape', value: 'Check-in le jour J' },
          ]),
          ...(isDeposit && soldeStr
            ? [
              alertBox(
                `<strong>Rappel solde&#160;:</strong> vous avez réglé un acompte de 30\u00a0%. Prévoyez le solde de <strong>${soldeStr}</strong> à remettre au propriétaire lors de la remise des clés.`,
                'warning'
              ),
            ]
            : []),
          alertBox(
            'Le jour de la prise en charge, <strong>les deux parties doivent confirmer le check-in</strong> sur AutoLoc pour démarrer officiellement la location et libérer le paiement.',
            'info'
          ),
        ].join(''),
      });
    },
  },

  // ── Réservation annulée ──────────────────────────────────────────────────────
  'reservation.cancelled': {
    subject: 'Réservation annulée',
    body: (data) =>
      baseLayout({
        title: 'Réservation annulée',
        subtitle:
          data.cancelledBy === 'PROPRIETAIRE'
            ? 'Le propriétaire a annulé. Votre remboursement est en cours.'
            : 'Votre réservation a été annulée.',
        badge: { text: 'Annulée', tone: 'rose' },
        cta: { label: 'Trouver un autre véhicule', href: `${FRONTEND_URL}/explorer` },
        content: [
          infoCard([
            { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}` },
            { label: 'Annulée par', value: data.cancelledBy === 'PROPRIETAIRE' ? 'Le propriétaire' : 'Vous' },
            ...(data.raison ? [{ label: 'Motif', value: String(data.raison) }] : []),
            ...(data.refundAmount
              ? [{ label: 'Remboursement', value: `${Number(data.refundAmount).toLocaleString('fr-FR')} FCFA` }]
              : []),
          ]),
          data.refundAmount
            ? alertBox(
              `Votre remboursement de <strong>${Number(data.refundAmount).toLocaleString('fr-FR')} FCFA</strong> sera crédité sous <strong>3 à 5 jours ouvrables</strong>.`,
              'info'
            )
            : alertBox('Aucun remboursement n\u2019est prévu selon les conditions d\u2019annulation.', 'warning'),
        ].join(''),
      }),
  },

  // ── Check-in confirmé (les deux parties) ─────────────────────────────────────
  'reservation.checkin': {
    subject: 'Check-in effectué — bonne route',
    body: (data) =>
      baseLayout({
        title: 'Check-in validé',
        subtitle: 'Les deux parties ont confirmé. La location commence.',
        badge: { text: 'En cours', tone: 'forest' },
        cta: { label: 'Voir ma réservation', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
        content: [
          p('Le check-in a été validé par les deux parties. La location est officiellement en cours.'),
          infoCard([
            { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}` },
            { label: 'Statut', value: 'Location en cours' },
          ]),
          alertBox(
            'Pensez à effectuer le <strong>check-out</strong> à la fin de la location pour clôturer officiellement le contrat.',
            'info'
          ),
        ].join(''),
      }),
  },

  // ── Check-in partiel — propriétaire a confirmé ────────────────────────────────
  'reservation.checkin.owner_confirmed': {
    subject: 'Le propriétaire a confirmé le check-in — à votre tour',
    body: (data) =>
      baseLayout({
        title: 'Check-in en attente',
        subtitle: 'Le propriétaire a confirmé. Il ne manque que vous.',
        badge: { text: 'Action requise', tone: 'amber' },
        cta: { label: 'Confirmer le check-in', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
        content: [
          p('Le propriétaire a confirmé la remise du véhicule. Il ne manque plus que <strong>votre confirmation</strong> pour démarrer officiellement la location.'),
          infoCard([
            { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}` },
            { label: 'Propriétaire', value: 'Confirmé' },
            { label: 'Locataire', value: 'En attente' },
          ]),
          alertBox('Connectez-vous sur AutoLoc et confirmez le check-in depuis votre espace réservation.', 'warning'),
        ].join(''),
      }),
  },

  // ── Check-in partiel — locataire a confirmé ──────────────────────────────────
  'reservation.checkin.tenant_confirmed': {
    subject: 'Le locataire a confirmé le check-in — à votre tour',
    body: (data) =>
      baseLayout({
        title: 'Check-in en attente',
        subtitle: 'Le locataire a confirmé. Il ne manque que vous.',
        badge: { text: 'Action requise', tone: 'amber' },
        cta: { label: 'Confirmer le check-in', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
        content: [
          p('Le locataire a confirmé la réception du véhicule. Il ne manque plus que <strong>votre confirmation</strong> pour démarrer officiellement la location.'),
          infoCard([
            { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}` },
            { label: 'Locataire', value: 'Confirmé' },
            { label: 'Propriétaire', value: 'En attente' },
          ]),
          alertBox('Connectez-vous sur AutoLoc et confirmez le check-in depuis votre espace réservation.', 'warning'),
        ].join(''),
      }),
  },

  // ── Fenêtre de validation tacite ──────────────────────────────────────────────
  'reservation.checkin.tacit_window': {
    subject: '6 h pour valider votre check-in',
    body: (data) =>
      baseLayout({
        title: 'Le propriétaire a enregistré le départ',
        subtitle: 'Validez ou signalez un problème dans les 6 heures.',
        badge: { text: 'Action requise', tone: 'amber' },
        cta: { label: 'Ouvrir la réservation', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
        content: [
          p('Le propriétaire a confirmé le check-in et l\u2019état des lieux de départ. <strong>Validez votre check-in</strong> dans l\u2019application, ou signalez un litige si vous n\u2019êtes pas d\u2019accord.'),
          p('Sans action de votre part sous <strong>6 heures</strong>, la location sera considérée comme démarrée sur la base de l\u2019état des lieux enregistré par le propriétaire (validation tacite, voir nos CGU).'),
          infoCard([{ label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}` }]),
        ].join(''),
      }),
  },

  'reservation.checkin.tacit_applied': {
    subject: 'Location démarrée — validation tacite du check-in',
    body: (data) =>
      baseLayout({
        title: 'Check-in validé automatiquement',
        subtitle: 'Vous n\u2019aviez pas confirmé dans le délai imparti.',
        badge: { text: 'En cours', tone: 'forest' },
        cta: { label: 'Voir la réservation', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
        content: [
          p('La location est considérée comme <strong>démarrée</strong>. Vous pouvez encore <strong>signaler un problème</strong> via le support ou la section litige, selon nos conditions générales.'),
          infoCard([{ label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}` }]),
        ].join(''),
      }),
  },

  // ── Rappel check-in la veille ─────────────────────────────────────────────────
  'reservation.checkin.reminder_veille': {
    subject: 'Demain, c\u2019est le grand jour',
    body: (data) =>
      baseLayout({
        title: 'Votre location commence demain',
        subtitle: 'Retrouvez l\u2019autre partie et confirmez la remise sur l\u2019app.',
        badge: { text: 'Rappel, J-1', tone: 'blue' },
        cta: { label: 'Voir ma réservation', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
        content: [
          infoCard([
            { label: 'Date de début', value: String(data.dateDebut ?? '') },
            { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}` },
          ]),
          alertBox(
            'Les <strong>deux parties doivent confirmer le check-in</strong> sur AutoLoc le jour J. Sans check-in, le paiement reste bloqué et la location ne démarre pas officiellement.',
            'info'
          ),
        ].join(''),
      }),
  },

  // ── Rappel check-in jour J ────────────────────────────────────────────────────
  'reservation.checkin.reminder_jour': {
    subject: 'Check-in non fait — il vous reste jusqu\u2019à minuit',
    body: (data) =>
      baseLayout({
        title: 'Check-in urgent',
        subtitle: 'La location a commencé mais le check-in n\u2019est pas finalisé.',
        badge: { text: 'Urgent', tone: 'rose' },
        cta: { label: 'Faire le check-in maintenant', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
        content: [
          infoCard([
            { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}` },
            { label: 'Délai limite', value: 'Ce soir avant minuit' },
          ]),
          alertBox(
            'Sans check-in avant minuit, la réservation sera <strong>annulée automatiquement</strong> et le paiement remboursé. Agissez maintenant.',
            'error'
          ),
        ].join(''),
      }),
  },

  // ── Rappel check-in urgent ────────────────────────────────────────────────────
  'reservation.checkin.reminder_urgent': {
    subject: 'Check-in en retard — agissez avant minuit',
    body: (data) =>
      baseLayout({
        title: 'Le check-in n\u2019a pas été effectué',
        subtitle: 'La location aurait dû commencer. Agissez avant minuit.',
        badge: { text: 'Retard de check-in', tone: 'rose' },
        cta: { label: 'Faire le check-in maintenant', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
        content: [
          infoCard([
            { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}` },
            { label: 'Délai limite', value: 'Ce soir avant minuit' },
          ]),
          alertBox(
            'Sans check-in avant minuit, la réservation sera <strong>annulée automatiquement</strong> et le paiement remboursé. Agissez maintenant.',
            'error'
          ),
        ].join(''),
      }),
  },

  // ── Check-out ─────────────────────────────────────────────────────────────────
  'reservation.checkout': {
    subject: 'Location terminée — votre avis compte',
    body: (data) =>
      baseLayout({
        title: 'Location terminée',
        subtitle: 'Merci de votre confiance. Un dernier geste compte beaucoup.',
        badge: { text: 'Terminée', tone: 'violet' },
        cta: { label: 'Laisser mon avis', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
        content: [
          infoCard([
            { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}` },
            { label: 'Statut', value: 'Terminée avec succès' },
          ]),
          divider(),
          p(
            'Les avis sont <strong>le moteur de la confiance</strong> sur AutoLoc. 30 secondes de votre part aident des dizaines de locataires à choisir le bon véhicule.',
            'text-align:center;font-weight:500;'
          ),
        ].join(''),
      }),
  },

  // ── Avis reçu ─────────────────────────────────────────────────────────────────
  'avis.recu': {
    subject: 'Nouvel avis — voyez ce qu\u2019on dit de vous',
    body: (data) =>
      baseLayout({
        title: 'Vous avez reçu un avis',
        subtitle: 'Un membre de la communauté vous a évalué.',
        badge: { text: 'Avis reçu', tone: 'amber' },
        cta: { label: 'Voir l\u2019avis', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
        content: [
          infoCard([
            { label: 'Note', value: starRating(Number(data.note ?? 0)) },
            ...(data.commentaire
              ? [{ label: 'Commentaire', value: `«\u00a0${String(data.commentaire)}\u00a0»` }]
              : []),
          ]),
          alertBox('Un bon score sur AutoLoc attire <strong>plus de réservations</strong>. Continuez ainsi.', 'info'),
        ].join(''),
      }),
  },

  // ── KYC vérifié ──────────────────────────────────────────────────────────────
  'kyc.verified': {
    subject: 'Identité vérifiée — vous pouvez louer dès maintenant',
    body: (data) =>
      baseLayout({
        title: `Vous êtes vérifié${data.prenom ? `, ${data.prenom}` : ''}`,
        subtitle: 'Accès complet débloqué. Louez ou publiez dès maintenant.',
        badge: { text: 'Vérifié', tone: 'forest' },
        cta: { label: 'Explorer les véhicules', href: `${FRONTEND_URL}/explorer` },
        content: [
          infoCard([
            { label: 'Louer un véhicule', value: 'Accès immédiat à toutes les annonces' },
            { label: 'Publier votre véhicule', value: 'Commencez à générer des revenus' },
            { label: 'Portefeuille propriétaire', value: 'Encaissez et retirez vos gains' },
          ]),
        ].join(''),
      }),
  },

  // ── KYC rejeté ───────────────────────────────────────────────────────────────
  'kyc.rejected': {
    subject: 'Vérification d\u2019identité — action requise',
    body: (data) =>
      baseLayout({
        title: 'Vérification non validée',
        subtitle: 'Des corrections sont nécessaires.',
        badge: { text: '\u00c0 corriger', tone: 'amber' },
        cta: { label: 'Soumettre à nouveau', href: `${FRONTEND_URL}/dashboard/settings` },
        content: [
          p('Votre dossier de vérification d\u2019identité n\u2019a pas pu être validé.'),
          ...(data.raison ? [infoCard([{ label: 'Motif du refus', value: String(data.raison) }])] : []),
          p('Pour soumettre à nouveau votre dossier, assurez-vous que\u00a0:'),
          `<ul style="margin:0 0 16px;padding-left:20px;color:#374151;font-family:${SANS};font-size:15px;line-height:2;">
            <li>les photos sont <strong>lisibles et nettes</strong>&#160;;</li>
            <li>les documents sont <strong>en cours de validité</strong>&#160;;</li>
            <li>les informations correspondent à <strong>votre profil</strong>.</li>
          </ul>`,
          p(`Pour toute question, contactez notre support à <a href="mailto:support@autoloc.sn" style="color:${FOREST};font-weight:600;">support@autoloc.sn</a>.`),
        ].join(''),
      }),
  },

  // ── Litige ouvert ────────────────────────────────────────────────────────────
  'litige.ouvert': {
    subject: 'Un litige a été ouvert sur votre réservation',
    body: (data) =>
      baseLayout({
        title: 'Litige en cours',
        subtitle: 'Notre équipe prend en charge votre dossier.',
        badge: { text: 'Litige ouvert', tone: 'rose' },
        cta: { label: 'Voir ma réservation', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
        content: [
          p('Un litige a été ouvert concernant votre réservation. Notre équipe va examiner le dossier dans les plus brefs délais.'),
          infoCard([
            { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}` },
            { label: 'Statut', value: 'En cours d\u2019examen' },
          ]),
          alertBox(
            'Notre équipe a été notifiée et traitera votre litige sous <strong>48 heures ouvrables</strong>. Vous serez informé de la résolution par email.',
            'info'
          ),
        ].join(''),
      }),
  },

  // ── Litige résolu ─────────────────────────────────────────────────────────────
  'litige.resolu': {
    subject: 'Litige résolu',
    body: (data) =>
      baseLayout({
        title: 'Litige résolu',
        subtitle: 'Notre équipe a traité votre dossier.',
        badge: { text: 'Résolu', tone: 'forest' },
        cta: { label: 'Voir ma réservation', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
        content: [
          p('Le litige concernant votre réservation a été résolu par notre équipe.'),
          infoCard([
            { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}` },
            ...(data.resolution ? [{ label: 'Résolution', value: String(data.resolution) }] : []),
          ]),
          p('Merci de votre patience. Pour toute question sur cette décision, contactez notre support.'),
        ].join(''),
      }),
  },

  // ── Portefeuille crédité ───────────────────────────────────────────────────────
  'wallet.credited': {
    subject: 'Votre argent est disponible — retirez quand vous voulez',
    body: (data) =>
      baseLayout({
        title: 'Revenu crédité',
        subtitle: 'Le check-in est validé. Vos fonds sont disponibles maintenant.',
        badge: { text: 'Portefeuille crédité', tone: 'forest' },
        cta: {
          label: 'Voir mon portefeuille',
          href: `${FRONTEND_URL}/login?next=${encodeURIComponent('/dashboard/owner/wallet')}&role=PROPRIETAIRE`,
        },
        content: [
          infoCard([
            { label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}` },
            ...(data.montant
              ? [{ label: 'Montant crédité', value: `${Number(data.montant).toLocaleString('fr-FR')} FCFA` }]
              : []),
            { label: 'Disponibilité', value: 'Immédiate' },
          ]),
          alertBox(
            'Vos fonds sont <strong>disponibles immédiatement</strong>. Effectuez un retrait vers votre compte Wave ou Orange Money depuis votre espace propriétaire.',
            'info'
          ),
        ].join(''),
      }),
  },

  // ── Rappel check-out ───────────────────────────────────────────────────────────
  'reservation.checkout.reminder': {
    subject: 'Votre location se termine bientôt',
    body: (data) =>
      baseLayout({
        title: 'Rappel de check-out',
        subtitle: 'Préparez-vous à rendre le véhicule.',
        badge: { text: 'Check-out', tone: 'violet' },
        cta: { label: 'Voir ma réservation', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
        content: [
          infoCard([{ label: 'Réservation', value: `#${String(data.reservationId ?? '').slice(0, 8).toUpperCase()}` }]),
          alertBox('N\u2019oubliez pas de faire le check-out sur l\u2019application avant de rendre le véhicule.', 'info'),
        ].join(''),
      }),
  },

  // ── Demande d'avis ───────────────────────────────────────────────────────────────
  'avis.request': {
    subject: 'Donnez votre avis sur votre trajet',
    body: (data) =>
      baseLayout({
        title: 'Votre avis compte',
        subtitle: 'Aidez la communauté en partageant votre expérience.',
        badge: { text: 'Avis', tone: 'amber' },
        cta: { label: 'Laisser un avis', href: `${FRONTEND_URL}/dashboard/reservations/${data.reservationId ?? ''}` },
        content: [
          p('Comment s\u2019est passé votre trajet\u00a0? Votre avis aide les autres utilisateurs à faire le bon choix.'),
        ].join(''),
      }),
  },

  // ── Code de vérification ───────────────────────────────────────────────────────
  'verification.code': {
    subject: 'Votre code de vérification AutoLoc',
    body: (data) =>
      baseLayout({
        title: 'Code de vérification',
        subtitle: 'Entrez ce code pour confirmer votre identité.',
        badge: { text: 'Sécurité', tone: 'forest' },
        content: [
          `<div style="margin:20px 0;padding:22px;text-align:center;border-radius:16px;
              background:${FOREST_SOFT};border:1px solid ${FOREST}22;">
             <span style="font-family:${SERIF};font-size:34px;letter-spacing:0.16em;color:${FOREST};">
               ${String(data.code ?? '')}
             </span>
           </div>`,
          alertBox('Ce code expire dans 5 minutes. Ne le partagez avec personne.', 'warning'),
        ].join(''),
      }),
  },

  'auth.login_otp': {
    subject: 'Votre code de connexion AutoLoc',
    body: (data) =>
      baseLayout({
        title: 'Code de connexion',
        subtitle: 'Utilisez ce code pour accéder à votre compte.',
        badge: { text: 'Connexion', tone: 'forest' },
        content: [
          `<div style="margin:20px 0;padding:22px;text-align:center;border-radius:16px;
              background:${FOREST_SOFT};border:1px solid ${FOREST}22;">
             <span style="font-family:${SERIF};font-size:34px;letter-spacing:0.16em;color:${FOREST};">
               ${String(data.otp ?? data.code ?? '')}
             </span>
           </div>`,
          alertBox('Ce code est strictement personnel. Ne le communiquez jamais.', 'warning'),
        ].join(''),
      }),
  },

  'user.status_changed': {
    subject: 'Mise à jour de votre compte AutoLoc',
    body: (data) =>
      baseLayout({
        title: 'Statut de votre compte',
        subtitle: 'Une modification a été apportée à votre accès.',
        badge: { text: 'Information', tone: 'neutral' },
        content: [
          p(`Bonjour${data.prenom ? ` ${data.prenom}` : ''},`),
          p(`Votre compte AutoLoc a été <strong>${data.statusText}</strong>.`),
          data.untilText ? p(`Cette mesure est effective <strong>${data.untilText}</strong>.`) : '',
          data.raison ? alertBox(`Raison\u00a0: ${data.raison}`, 'info') : '',
          p('Pour toute question, contactez notre support.'),
        ].join(''),
      }),
  },

  'vehicle.validated': {
    subject: 'Votre véhicule est en ligne',
    body: (data) =>
      baseLayout({
        title: 'Véhicule validé',
        subtitle: 'Votre annonce est maintenant visible par tous.',
        badge: { text: 'En ligne', tone: 'forest' },
        content: [
          p(`Bonjour${data.prenom ? ` ${data.prenom}` : ''},`),
          p(`Bonne nouvelle\u00a0! Votre véhicule <strong>${data.vehicule}</strong> a été validé par notre équipe.`),
          p('Il est maintenant disponible à la location sur AutoLoc.'),
          alertBox('Pensez à garder votre calendrier à jour pour éviter les annulations.', 'info'),
        ].join(''),
      }),
  },

  'vehicle.suspended': {
    subject: 'Votre annonce a été suspendue',
    body: (data) =>
      baseLayout({
        title: 'Annonce suspendue',
        subtitle: 'Votre véhicule n\u2019est plus visible temporairement.',
        badge: { text: 'Suspendu', tone: 'rose' },
        content: [
          p(`Bonjour${data.prenom ? ` ${data.prenom}` : ''},`),
          p(`Votre véhicule <strong>${data.vehicule}</strong> a été suspendu sur AutoLoc.`),
          data.raison ? alertBox(`Raison\u00a0: ${data.raison}`, 'warning') : '',
          p('Contactez notre support pour plus d\u2019informations.'),
        ].join(''),
      }),
  },

  'vehicle.featured': {
    subject: 'Votre véhicule est mis en avant',
    body: (data) =>
      baseLayout({
        title: 'Mise en avant activée',
        subtitle: 'Boostez vos réservations avec une visibilité prioritaire.',
        badge: { text: 'Mis en avant', tone: 'gold' },
        content: [
          p(`Bonjour${data.prenom ? ` ${data.prenom}` : ''},`),
          p(`Félicitations\u00a0! Votre véhicule <strong>${data.vehicule}</strong> est maintenant mis en avant sur AutoLoc.`),
          p('Il apparaîtra en priorité dans les résultats de recherche.'),
        ].join(''),
      }),
  },

  'host.fleet_suspended': {
    subject: 'Suspension temporaire de votre flotte',
    body: (data) =>
      baseLayout({
        title: 'Suspension de votre flotte',
        subtitle: 'Vos véhicules ont été temporairement retirés de la recherche.',
        badge: { text: 'Flotte suspendue', tone: 'rose' },
        content: [
          p(`Bonjour${data.prenom ? ` ${data.prenom}` : ''},`),
          p('Votre flotte de véhicules a été suspendue à la suite d\u2019un contrôle administratif.'),
          data.raison ? alertBox(`Raison\u00a0: ${data.raison}`, 'warning') : '',
          p(`Pour régulariser votre situation, contactez le support AutoLoc à <a href="mailto:support@autoloc.sn" style="color:${FOREST};font-weight:600;">support@autoloc.sn</a>.`),
        ].join(''),
      }),
  },

  'host.fleet_activated': {
    subject: 'Réactivation de votre flotte de véhicules',
    body: (data) =>
      baseLayout({
        title: 'Flotte réactivée',
        subtitle: 'Vos véhicules sont à nouveau en ligne et réservables.',
        badge: { text: 'En ligne', tone: 'forest' },
        content: [
          p(`Bonjour${data.prenom ? ` ${data.prenom}` : ''},`),
          p('Bonne nouvelle\u00a0! Votre flotte de véhicules a été réactivée sur AutoLoc.'),
          alertBox('Pensez à garder les calendriers de vos véhicules à jour.', 'info'),
        ].join(''),
      }),
  },

  // ── Notifications admin ──────────────────────────────────────────────────────

  'admin.withdrawal.requested': {
    subject: '[AutoLoc Admin] Demande de retrait',
    body: (data) =>
      baseLayout({
        title: 'Nouvelle demande de retrait',
        subtitle: 'Action requise pour traiter le retrait.',
        badge: { text: 'Admin', tone: 'rose' },
        cta: { label: 'Traiter les retraits', href: 'https://autoloc.sn/dashboard/admin/withdrawals' },
        content: [
          infoCard([
            { label: 'Propriétaire', value: String(data.ownerName || 'Non renseigné') },
            { label: 'Montant', value: `${Number(data.montant || 0).toLocaleString('fr-FR')} FCFA` },
            { label: 'Méthode', value: data.methode === 'WAVE' ? 'Wave' : 'Orange Money' },
            {
              label: 'Numéro',
              value: `<span style="font-family:monospace;background:${LIGHT_GRAY};padding:2px 6px;border-radius:4px;font-size:13px;">${data.numeroDestinataire}</span>`,
            },
            { label: 'Demandé le', value: String(data.requestedAt || new Date().toLocaleDateString('fr-FR')) },
          ]),
          p('<strong>Action requise\u00a0:</strong>'),
          `<ol style="margin:16px 0;padding-left:24px;color:${GRAY};font-family:${SANS};font-size:14px;line-height:1.7;">
            <li>Exportez le CSV des retraits en attente</li>
            <li>Chargez-le sur InTouch BO (paiement groupé)</li>
            <li>Validez sur le tableau de bord</li>
          </ol>`,
        ].join(''),
      }),
  },

  'admin.reservation.cancelled': {
    subject: '[AutoLoc Admin] Annulation de réservation',
    body: (data) => {
      const isLocataire = data.cancelledBy === 'LOCATAIRE';
      const isCritical = data.refundAmount && Number(data.refundAmount) > 0;

      return baseLayout({
        title: 'Réservation annulée',
        subtitle: `Annulée par\u00a0: ${isLocataire ? 'le locataire' : 'le propriétaire'}`,
        badge: isCritical ? { text: 'Action requise', tone: 'rose' } : { text: 'Information', tone: 'blue' },
        cta: { label: 'Voir la réservation', href: `https://autoloc.sn/dashboard/admin/reservations/${data.reservationId}` },
        content: [
          infoCard([
            { label: 'Véhicule', value: String(data.vehicule || 'Non renseigné') },
            {
              label: 'Dates',
              value: `${data.dateDebut ? new Date(String(data.dateDebut)).toLocaleDateString('fr-FR') : '–'} → ${data.dateFin ? new Date(String(data.dateFin)).toLocaleDateString('fr-FR') : '–'
                }`,
            },
            { label: 'Annulé par', value: `${isLocataire ? 'Locataire' : 'Propriétaire'} (${data.cancelledByName || 'non renseigné'})` },
            { label: 'Raison', value: String(data.raison || 'Non précisée') },
            {
              label: 'Annulé le',
              value: new Date().toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
            },
          ]),
          `<div style="margin:20px 0;padding:18px 20px;background:${LIGHT_GRAY};border-left:3px solid ${FOREST};border-radius:0 12px 12px 0;">
            <p style="margin:0 0 10px;font-family:${SANS};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:${GRAY};">Politique appliquée</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:${SANS};">
              <tr style="border-bottom:1px solid ${BORDER};">
                <td style="padding:8px 0;font-size:13px;color:${GRAY};">Remboursement locataire</td>
                <td style="padding:8px 0;font-size:14px;font-weight:700;text-align:right;color:${DARK};">
                  ${data.refundPercentage || 0}\u00a0% (${Number(data.refundAmount || 0).toLocaleString('fr-FR')} FCFA)
                </td>
              </tr>
              <tr${!isLocataire ? ` style="border-bottom:1px solid ${BORDER};"` : ''}>
                <td style="padding:8px 0;font-size:13px;color:${GRAY};">Commission retenue</td>
                <td style="padding:8px 0;font-size:14px;font-weight:700;text-align:right;color:${DARK};">
                  ${Number(data.commissionRetained || 0).toLocaleString('fr-FR')} FCFA
                </td>
              </tr>
              ${!isLocataire
            ? `<tr>
                <td style="padding:8px 0;font-size:13px;color:${GRAY};">Pénalité propriétaire</td>
                <td style="padding:8px 0;font-size:14px;font-weight:700;text-align:right;color:#B91C1C;">
                  ${Number(data.ownerPenaltyAmount || 0).toLocaleString('fr-FR')} FCFA (${data.ownerPenaltyPercentage || 0}\u00a0%)
                </td>
              </tr>`
            : ''
          }
            </table>
          </div>`,
          isCritical
            ? p(`<strong>Action requise\u00a0:</strong> rembourser <strong>${Number(data.refundAmount).toLocaleString('fr-FR')} FCFA</strong> au locataire via InTouch.`)
            : '',
        ].join(''),
      });
    },
  },

  'admin.refund.processed': {
    subject: '[AutoLoc Admin] Remboursement effectué',
    body: (data) =>
      baseLayout({
        title: 'Remboursement traité',
        subtitle: `Locataire remboursé via ${data.fournisseur || 'InTouch'}`,
        badge: { text: 'Confirmé', tone: 'forest' },
        cta: { label: 'Voir les remboursements', href: 'https://autoloc.sn/dashboard/admin/refunds' },
        content: [
          infoCard([
            {
              label: 'Locataire',
              value: `${data.locataireNom || 'Non renseigné'}${data.locataireEmail ? `<br/><span style="font-size:12px;font-weight:400;color:${GRAY};">${data.locataireEmail}</span>` : ''
                }`,
            },
            { label: 'Montant remboursé', value: `<span style="color:${FOREST};">${data.montant || 0} FCFA</span>` },
            { label: 'Méthode', value: String(data.fournisseur || 'InTouch') },
            { label: 'Véhicule', value: String(data.vehicule || 'Non renseigné') },
            { label: 'Réservation', value: String(data.reservationId || 'Non renseigné') },
            { label: 'Traité le', value: String(data.processedAt || new Date().toLocaleDateString('fr-FR')) },
          ]),
          p('Le remboursement a été marqué comme effectué dans le système. Le locataire peut désormais voir le statut «\u00a0Remboursé\u00a0» sur son contrat.'),
        ].join(''),
      }),
  },
};

/**
 * Génère le template HTML d'un email de broadcast rédigé par un administrateur.
 */
export function buildBroadcastEmailHtml(opts: {
  title: string;
  message: string;
  url?: string;
  imageUrl?: string;
}): string {
  const content = [
    opts.imageUrl
      ? `<div style="margin-bottom:24px;border-radius:16px;overflow:hidden;border:1px solid ${BORDER};">
           <img src="${opts.imageUrl}" alt="" style="width:100%;max-height:240px;object-fit:cover;display:block;">
         </div>`
      : '',
    `<div style="font-family:${SANS};font-size:15px;line-height:1.8;color:#374151;white-space:pre-line;">${opts.message}</div>`,
  ].join('');

  return baseLayout({
    title: opts.title,
    badge: { text: 'Information AutoLoc', tone: 'forest' },
    cta: opts.url
      ? {
        label: 'Accéder à la plateforme',
        href: opts.url.startsWith('http') ? opts.url : `${FRONTEND_URL}${opts.url}`,
      }
      : undefined,
    content,
  });
}