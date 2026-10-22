import { buildReservationDecompte } from './reservation-decompte';

describe('buildReservationDecompte', () => {
    const base = {
        dateDebut: '2026-11-01T00:00:00Z',
        dateFin: '2026-11-04T00:00:00Z',
        tauxCommission: '0.1',
        modePaiement: 'TOTAL_EN_LIGNE',
    };

    it('should split location, hors Dakar, chauffeur, livraison and service fee', () => {
        const d = buildReservationDecompte({
            ...base,
            prixParJour: '20000',
            horsDakar: true,
            supplementHorsDakar: '5000',
            nbJoursHorsDakar: 1,
            avecChauffeur: true,
            prixChauffeurParJour: '15000',
            fraisLivraison: '10000',
            typeLivraison: 'DAKAR',
            montantCommission: '6000',
            totalLocataire: '126000',
            netProprietaire: '120000', // location + hors Dakar + chauffeur + livraison
        });
        expect(d.nbJours).toBe(3);
        expect(d.location).toEqual({ prixParJour: 20000, nbJours: 3, montant: 60000 });
        expect(d.horsDakar).toEqual({ prixParJour: 5000, nbJours: 1, montant: 5000 });
        expect(d.chauffeur).toEqual({ prixParJour: 15000, nbJours: 3, montant: 45000 });
        expect(d.livraison).toEqual({ type: 'DAKAR', montant: 10000, pourProprietaire: true });
        expect(d.commission).toEqual({ taux: 0.1, montant: 6000 });
        // Les lignes retombent exactement sur le total payé
        expect(d.location.montant + 5000 + 45000 + 10000 + 6000).toBe(d.totalLocataire);
        expect(d.revenuProprietaire).toBe(120000);
        expect(d.payeEnLigne).toBe(126000);
        expect(d.soldeCheckin).toBe(0);
    });

    it('should strip the supplement from legacy prixParJour (before nbJoursHorsDakar existed)', () => {
        const d = buildReservationDecompte({
            ...base,
            prixParJour: '25000', // 20000 + 5000 de supplément inclus
            horsDakar: true,
            supplementHorsDakar: '5000',
            nbJoursHorsDakar: null,
        });
        expect(d.location.prixParJour).toBe(20000);
        expect(d.horsDakar).toEqual({ prixParJour: 5000, nbJours: 3, montant: 15000 });
    });

    it('should return null options when not subscribed', () => {
        const d = buildReservationDecompte({ ...base, prixParJour: '20000' });
        expect(d.horsDakar).toBeNull();
        expect(d.chauffeur).toBeNull();
        expect(d.livraison).toBeNull();
    });

    it('should compute the deposit balance', () => {
        const d = buildReservationDecompte({
            ...base,
            prixParJour: '20000',
            modePaiement: 'ACOMPTE_SOLDE_CHECKIN',
            totalLocataire: '66000',
            montantPayeEnLigne: '19800',
            montantSoldeCheckin: '46200',
        });
        expect(d.payeEnLigne).toBe(19800);
        expect(d.soldeCheckin).toBe(46200);
    });
});
