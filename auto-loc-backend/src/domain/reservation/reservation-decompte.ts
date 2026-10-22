/**
 * Décompte financier d'une réservation — source unique pour les pages détail
 * (locataire & propriétaire) et le contrat PDF.
 *
 * Tous les montants proviennent de ce qui a été figé en base à la réservation :
 * on ne recalcule jamais un tarif à partir du véhicule actuel.
 */

export interface DecompteLigne {
    prixParJour: number;
    nbJours: number;
    montant: number;
}

export interface ReservationDecompte {
    nbJours: number;
    /** Location seule (tarif progressif appliqué). */
    location: DecompteLigne;
    /** Supplément hors Dakar — sans commission. */
    horsDakar: DecompteLigne | null;
    /** Chauffeur — sans commission, sur toute la durée. */
    chauffeur: DecompteLigne | null;
    /**
     * Livraison. `pourProprietaire` : incluse dans le revenu du propriétaire
     * (toutes les réservations depuis la correction ; false pour les plus anciennes déjà versées).
     */
    livraison: { type: 'DAKAR' | 'AIBD' | 'AUTRE'; montant: number; pourProprietaire: boolean } | null;
    /** Frais de service AutoLoc, payés par le locataire en plus du prix. */
    commission: { taux: number; montant: number };
    totalLocataire: number;
    /** Ce que le propriétaire perçoit (location + options + livraison), hors frais de service. */
    revenuProprietaire: number;
    modePaiement: 'TOTAL_EN_LIGNE' | 'ACOMPTE_SOLDE_CHECKIN';
    payeEnLigne: number;
    soldeCheckin: number;
}

const num = (v: unknown): number => {
    const n = Number(v ?? 0);
    return Number.isFinite(n) ? n : 0;
};

export function countNbJours(dateDebut: unknown, dateFin: unknown): number {
    const debut = new Date(dateDebut as string).getTime();
    const fin = new Date(dateFin as string).getTime();
    if (!Number.isFinite(debut) || !Number.isFinite(fin)) return 1;
    return Math.max(1, Math.round((fin - debut) / 86_400_000));
}

/**
 * Décompose le supplément hors Dakar d'une réservation.
 * Réservations antérieures à `nbJoursHorsDakar` : le supplément était inclus dans
 * `prixParJour` et facturé sur toute la durée — on le retire pour l'affichage.
 */
export function describeHorsDakar(r: Record<string, unknown>, nbJours: number) {
    const prixParJour = num(r.prixParJour);
    const supplement = num(r.supplementHorsDakar);
    if (!r.horsDakar || supplement <= 0) {
        return {
            horsDakar: false,
            supplementParJour: null,
            nbJoursHorsDakar: null,
            montantHorsDakar: null,
            prixParJourLocation: String(r.prixParJour ?? '0'),
        };
    }
    const isLegacy = r.nbJoursHorsDakar == null;
    const jours = isLegacy ? nbJours : num(r.nbJoursHorsDakar);
    return {
        horsDakar: true,
        supplementParJour: String(supplement),
        nbJoursHorsDakar: jours,
        montantHorsDakar: String(supplement * jours),
        prixParJourLocation: String(isLegacy ? prixParJour - supplement : prixParJour),
    };
}

/** Option chauffeur : prix figé à la réservation, facturé sur toute la durée. */
export function describeChauffeur(r: Record<string, unknown>, nbJours: number) {
    const prix = num(r.prixChauffeurParJour);
    const avecChauffeur = !!r.avecChauffeur;
    return {
        avecChauffeur,
        prixChauffeurParJour: avecChauffeur && prix > 0 ? String(prix) : null,
        montantChauffeur: avecChauffeur && prix > 0 ? String(prix * nbJours) : null,
    };
}

export function buildReservationDecompte(r: Record<string, unknown>): ReservationDecompte {
    const nbJours = countNbJours(r.dateDebut, r.dateFin);
    const hd = describeHorsDakar(r, nbJours);
    const ch = describeChauffeur(r, nbJours);

    const prixLocation = num(hd.prixParJourLocation);

    const fraisLivraison = num(r.fraisLivraison);
    const typeLivraison = r.typeLivraison === 'AIBD' ? 'AIBD' : r.typeLivraison === 'DAKAR' ? 'DAKAR' : 'AUTRE';

    const totalLocataire = num(r.totalLocataire);
    const modePaiement = r.modePaiement === 'ACOMPTE_SOLDE_CHECKIN' ? 'ACOMPTE_SOLDE_CHECKIN' : 'TOTAL_EN_LIGNE';
    const payeEnLigne = r.montantPayeEnLigne != null ? num(r.montantPayeEnLigne) : totalLocataire;
    const soldeCheckin = modePaiement === 'ACOMPTE_SOLDE_CHECKIN'
        ? (r.montantSoldeCheckin != null ? num(r.montantSoldeCheckin) : Math.max(0, totalLocataire - payeEnLigne))
        : 0;

    const revenuProprietaire = num(r.netProprietaire);
    const horsLivraison = prixLocation * nbJours + num(hd.montantHorsDakar) + num(ch.montantChauffeur);
    const livraisonPourProprietaire = fraisLivraison > 0 && revenuProprietaire >= horsLivraison + fraisLivraison - 0.5;

    return {
        nbJours,
        location: { prixParJour: prixLocation, nbJours, montant: prixLocation * nbJours },
        horsDakar: hd.horsDakar
            ? { prixParJour: num(hd.supplementParJour), nbJours: hd.nbJoursHorsDakar ?? 0, montant: num(hd.montantHorsDakar) }
            : null,
        chauffeur: ch.montantChauffeur
            ? { prixParJour: num(ch.prixChauffeurParJour), nbJours, montant: num(ch.montantChauffeur) }
            : null,
        livraison: fraisLivraison > 0
            ? { type: typeLivraison, montant: fraisLivraison, pourProprietaire: livraisonPourProprietaire }
            : null,
        commission: { taux: num(r.tauxCommission), montant: num(r.montantCommission) },
        totalLocataire,
        revenuProprietaire,
        modePaiement,
        payeEnLigne,
        soldeCheckin,
    };
}
