// ── Email Templates ────────────────────────────────────────────────────────────
// Templates HTML minimalistes et professionnels pour chaque type de notification.

export type NotificationType =
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
    | 'litige.ouvert'
    | 'litige.resolu'
    | 'wallet.credited';

interface TemplateConfig {
    subject: string;
    body: (data: Record<string, unknown>) => string;
}

const BRAND_COLOR = '#2563EB';
const BRAND_NAME = 'AutoLoc';

function baseLayout(title: string, content: string): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
        <tr>
          <td style="background:${BRAND_COLOR};padding:24px 32px;">
            <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">${BRAND_NAME}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 16px;color:#18181b;font-size:18px;">${title}</h2>
            ${content}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;background:#fafafa;border-top:1px solid #e4e4e7;">
            <p style="margin:0;color:#a1a1aa;font-size:12px;text-align:center;">
              ${BRAND_NAME} — Location de véhicules entre particuliers au Sénégal
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

function p(text: string): string {
    return `<p style="margin:0 0 12px;color:#3f3f46;font-size:14px;line-height:1.6;">${text}</p>`;
}

function highlight(label: string, value: string): string {
    return `<div style="background:#f0f9ff;border-left:3px solid ${BRAND_COLOR};padding:12px 16px;margin:12px 0;border-radius:0 6px 6px 0;">
    <strong style="color:#18181b;">${label}</strong><br>
    <span style="color:#3f3f46;">${value}</span>
  </div>`;
}

// ── Templates ──────────────────────────────────────────────────────────────────

export const EMAIL_TEMPLATES: Record<NotificationType, TemplateConfig> = {
    'reservation.confirmed': {
        subject: 'Réservation confirmée ✅',
        body: (data) => baseLayout('Réservation confirmée', [
            p('Votre réservation a été confirmée par le propriétaire.'),
            highlight('Réservation', String(data.reservationId ?? '')),
            p('Le véhicule vous attend — n\'oubliez pas de faire le check-in le jour J !'),
        ].join('')),
    },

    'reservation.paid': {
        subject: 'Paiement reçu 💰',
        body: (data) => baseLayout('Paiement confirmé', [
            p('Le paiement pour votre réservation a bien été confirmé.'),
            highlight('Réservation', String(data.reservationId ?? '')),
            p('Votre contrat de location est en cours de génération.'),
        ].join('')),
    },

    'reservation.cancelled': {
        subject: 'Réservation annulée ❌',
        body: (data) => baseLayout('Réservation annulée', [
            p(`La réservation a été annulée${data.raison ? ` : ${data.raison}` : ''}.`),
            highlight('Réservation', String(data.reservationId ?? '')),
            data.refundAmount
                ? p(`Montant remboursé : <strong>${data.refundAmount} FCFA</strong>`)
                : '',
        ].join('')),
    },

    'reservation.checkin': {
        subject: 'Check-in effectué 🚗',
        body: (data) => baseLayout('Check-in effectué', [
            p('Le check-in a été effectué avec succès.'),
            highlight('Réservation', String(data.reservationId ?? '')),
            p('Bonne route ! N\'oubliez pas le check-out à la fin de la location.'),
        ].join('')),
    },

    'reservation.checkin.owner_confirmed': {
        subject: 'Le propriétaire a confirmé le check-in',
        body: (data) => baseLayout('Check-in en attente de votre confirmation', [
            p('Le propriétaire a confirmé le check-in. Il ne manque plus que votre confirmation pour démarrer la location.'),
            highlight('Réservation', String(data.reservationId ?? '')),
            p('Connectez-vous à AutoLoc pour confirmer le check-in.'),
        ].join('')),
    },

    'reservation.checkin.tenant_confirmed': {
        subject: 'Le locataire a confirmé le check-in',
        body: (data) => baseLayout('Check-in en attente de votre confirmation', [
            p('Le locataire a confirmé le check-in. Il ne manque plus que votre confirmation pour démarrer la location.'),
            highlight('Réservation', String(data.reservationId ?? '')),
            p('Connectez-vous à AutoLoc pour confirmer le check-in.'),
        ].join('')),
    },

    'reservation.checkin.reminder_veille': {
        subject: 'Rappel — Check-in demain 📅',
        body: (data) => baseLayout('Votre location commence demain', [
            p(`Bonjour <strong>${String(data.prenom ?? '')}</strong>,`),
            p('Votre location démarre demain. Pensez à effectuer le check-in le jour J avec l\'autre partie.'),
            highlight('Date de début', String(data.dateDebut ?? '')),
            p('Le check-in confirme la remise du véhicule et déclenche le début officiel de la location.'),
        ].join('')),
    },

    'reservation.checkin.reminder_jour': {
        subject: '⚠️ Check-in non effectué — Il vous reste peu de temps',
        body: (data) => baseLayout('Check-in non effectué', [
            p(`Bonjour <strong>${String(data.prenom ?? '')}</strong>,`),
            p('Votre location a commencé aujourd\'hui mais le check-in n\'a pas encore été finalisé.'),
            highlight('Date de début', String(data.dateDebut ?? '')),
            p('<strong>Si le check-in n\'est pas effectué avant minuit, la réservation sera automatiquement annulée.</strong>'),
            p('Connectez-vous à AutoLoc dès maintenant pour régulariser la situation.'),
        ].join('')),
    },

    'reservation.checkout': {
        subject: 'Check-out effectué — Location terminée 🏁',
        body: (data) => baseLayout('Location terminée', [
            p('Le check-out a été effectué. La location est maintenant terminée.'),
            highlight('Réservation', String(data.reservationId ?? '')),
            p('Pensez à laisser un avis pour votre expérience !'),
        ].join('')),
    },

    'avis.recu': {
        subject: 'Nouvel avis reçu ⭐',
        body: (data) => baseLayout('Nouvel avis', [
            p(`Vous avez reçu un nouvel avis : <strong>${data.note}/5</strong>`),
            data.commentaire
                ? highlight('Commentaire', String(data.commentaire))
                : '',
        ].join('')),
    },

    'kyc.verified': {
        subject: 'Identité vérifiée ✅',
        body: () => baseLayout('KYC Validé', [
            p('Votre vérification d\'identité a été validée avec succès.'),
            p('Vous pouvez maintenant publier des véhicules et effectuer des réservations.'),
        ].join('')),
    },

    'litige.ouvert': {
        subject: 'Litige ouvert 🚨',
        body: (data) => baseLayout('Litige ouvert', [
            p('Un litige a été ouvert concernant votre réservation.'),
            highlight('Réservation', String(data.reservationId ?? '')),
            p('Notre équipe va examiner le dossier. Vous serez notifié de la résolution.'),
        ].join('')),
    },

    'litige.resolu': {
        subject: 'Litige résolu ✅',
        body: (data) => baseLayout('Litige résolu', [
            p('Le litige concernant votre réservation a été résolu.'),
            highlight('Réservation', String(data.reservationId ?? '')),
            data.resolution
                ? p(`Résolution : ${data.resolution}`)
                : '',
        ].join('')),
    },

    'wallet.credited': {
        subject: 'Revenu crédité sur votre wallet 💰',
        body: (data) => baseLayout('Revenu disponible', [
            p(`Bonjour <strong>${String(data.proprietairePrenom ?? '')}</strong>,`),
            p('Le check-in a été finalisé. Votre revenu de location a été crédité sur votre wallet AutoLoc.'),
            highlight('Réservation', String(data.reservationId ?? '')),
            p('Vous pouvez consulter votre solde et demander un retrait depuis votre espace propriétaire.'),
        ].join('')),
    },
};
