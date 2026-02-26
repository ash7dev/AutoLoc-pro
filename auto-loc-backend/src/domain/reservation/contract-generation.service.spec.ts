import { ContractGenerationService } from './contract-generation.service';

// ── Mocks ──────────────────────────────────────────────────────────────────────

const RESERVATION_ID = 'res-456';

const mockReservation = {
    id: RESERVATION_ID,
    dateDebut: new Date('2026-03-01'),
    dateFin: new Date('2026-03-05'),
    prixParJour: { toString: () => '25000' },
    totalBase: { toString: () => '100000' },
    montantCommission: { toString: () => '15000' },
    totalLocataire: { toString: () => '115000' },
    netProprietaire: { toString: () => '100000' },
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
};

const mockPrisma = {
    reservation: {
        findUniqueOrThrow: jest.fn().mockResolvedValue(mockReservation),
        update: jest.fn().mockResolvedValue({}),
    },
};

const mockCloudinary = {
    uploadContract: jest.fn().mockResolvedValue({
        url: 'https://res.cloudinary.com/test/contrats/contrat-res-456.pdf',
        publicId: 'contrats/contrat-res-456',
    }),
};

const mockPdfBuffer = Buffer.from('%PDF-1.4 test content');
const mockPdfService = {
    generate: jest.fn().mockResolvedValue(mockPdfBuffer),
};

describe('ContractGenerationService', () => {
    let service: ContractGenerationService;

    beforeEach(() => {
        jest.clearAllMocks();
        mockPrisma.reservation.findUniqueOrThrow.mockResolvedValue(mockReservation);
        mockPrisma.reservation.update.mockResolvedValue({});
        mockCloudinary.uploadContract.mockResolvedValue({
            url: 'https://res.cloudinary.com/test/contrats/contrat-res-456.pdf',
            publicId: 'contrats/contrat-res-456',
        });
        mockPdfService.generate.mockResolvedValue(mockPdfBuffer);
        service = new ContractGenerationService(
            mockPrisma as any,
            mockCloudinary as any,
            mockPdfService as any,
        );
    });

    it('should fetch reservation, generate PDF, upload, and update', async () => {
        const result = await service.generateAndStore(RESERVATION_ID);

        // 1. Fetched reservation
        expect(mockPrisma.reservation.findUniqueOrThrow).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: RESERVATION_ID },
            }),
        );

        // 2. Generated PDF with correct data
        expect(mockPdfService.generate).toHaveBeenCalledWith(
            expect.objectContaining({
                reservationId: RESERVATION_ID,
                locataire: expect.objectContaining({ prenom: 'Amadou' }),
                proprietaire: expect.objectContaining({ prenom: 'Fatou' }),
                vehicule: expect.objectContaining({ marque: 'Toyota' }),
                tarifs: expect.objectContaining({ nbJours: 4 }),
            }),
        );

        // 3. Uploaded to Cloudinary
        expect(mockCloudinary.uploadContract).toHaveBeenCalledWith(
            mockPdfBuffer,
            RESERVATION_ID,
        );

        // 4. Updated reservation with contratUrl
        expect(mockPrisma.reservation.update).toHaveBeenCalledWith({
            where: { id: RESERVATION_ID },
            data: {
                contratUrl: 'https://res.cloudinary.com/test/contrats/contrat-res-456.pdf',
                contratPublicId: 'contrats/contrat-res-456',
            },
        });

        // 5. Returned result
        expect(result.contratUrl).toBe(
            'https://res.cloudinary.com/test/contrats/contrat-res-456.pdf',
        );
        expect(result.contratPublicId).toBe('contrats/contrat-res-456');
    });

    it('should propagate errors from PDF generation', async () => {
        mockPdfService.generate.mockRejectedValue(new Error('PDF generation failed'));

        await expect(service.generateAndStore(RESERVATION_ID)).rejects.toThrow(
            'PDF generation failed',
        );
    });

    it('should propagate errors from Cloudinary upload', async () => {
        mockCloudinary.uploadContract.mockRejectedValue(new Error('Upload failed'));

        await expect(service.generateAndStore(RESERVATION_ID)).rejects.toThrow(
            'Upload failed',
        );
    });
});
