import { ContractPdfService, ContractData } from './contract-pdf.service';

describe('ContractPdfService', () => {
    let service: ContractPdfService;

    beforeEach(() => {
        service = new ContractPdfService();
    });

    const sampleData: ContractData = {
        reservationId: 'res-123-abc',
        dateContrat: '25 février 2026',
        statutContrat: 'ACTIF',
        locataire: {
            prenom: 'Amadou',
            nom: 'Diallo',
            telephone: '+221771234567',
            email: 'amadou@test.com',
        },
        proprietaire: {
            prenom: 'Fatou',
            nom: 'Sow',
            telephone: '+221779876543',
            email: 'fatou@test.com',
        },
        vehicule: {
            marque: 'Toyota',
            modele: 'Corolla',
            annee: 2023,
            type: 'BERLINE',
            immatriculation: 'DK-1234-AB',
            ville: 'Dakar',
        },
        tarifs: {
            dateDebut: '01/03/2026',
            dateFin: '05/03/2026',
            nbJours: 4,
            prixParJour: '25000',
            totalBase: '100000',
            commission: '15000',
            totalLocataire: '115000',
            netProprietaire: '100000',
        },
    };

    it('should generate a non-empty PDF buffer', async () => {
        const buffer = await service.generate(sampleData);

        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.length).toBeGreaterThan(0);
    });

    it('should contain PDF header bytes (%PDF)', async () => {
        const buffer = await service.generate(sampleData);
        const header = buffer.subarray(0, 5).toString('ascii');

        expect(header).toBe('%PDF-');
    });

    it('should produce a reasonably sized PDF (> 1KB)', async () => {
        const buffer = await service.generate(sampleData);

        // A proper contract PDF with multiple sections should be at least 1KB
        expect(buffer.length).toBeGreaterThan(1024);
    });

    it('should handle special characters in names', async () => {
        const dataWithSpecial = {
            ...sampleData,
            locataire: { ...sampleData.locataire, prenom: 'Ibrahima', nom: "N'Diaye" },
        };

        const buffer = await service.generate(dataWithSpecial);
        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.length).toBeGreaterThan(0);
    });
});
