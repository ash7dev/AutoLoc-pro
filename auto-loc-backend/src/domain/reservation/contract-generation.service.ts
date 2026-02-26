import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../infrastructure/cloudinary/cloudinary.service';
import {
    ContractPdfService,
    ContractData,
    StatutContrat,
} from '../../infrastructure/contract/contract-pdf.service';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ContractGenerationResult {
    contratUrl: string;
    contratPublicId: string;
}

export interface ContractGenerationOptions {
    statutContrat: StatutContrat;
    raisonAnnulation?: string;
    dateAnnulation?: string;
}

// ── Service ────────────────────────────────────────────────────────────────────

@Injectable()
export class ContractGenerationService {
    private readonly logger = new Logger(ContractGenerationService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinary: CloudinaryService,
        private readonly pdfService: ContractPdfService,
    ) { }

    /**
     * Génère (ou regénère) le contrat PDF et le stocke sur Cloudinary.
     * Met à jour la réservation avec l'URL du contrat.
     */
    async generateAndStore(
        reservationId: string,
        options: ContractGenerationOptions = { statutContrat: 'ACTIF' },
    ): Promise<ContractGenerationResult> {
        // ── 1. Fetch all data ──────────────────────────────────────────────
        const reservation = await this.prisma.reservation.findUniqueOrThrow({
            where: { id: reservationId },
            select: {
                id: true,
                dateDebut: true,
                dateFin: true,
                prixParJour: true,
                totalBase: true,
                montantCommission: true,
                totalLocataire: true,
                netProprietaire: true,
                contratPublicId: true,
                locataire: {
                    select: {
                        prenom: true,
                        nom: true,
                        telephone: true,
                        email: true,
                    },
                },
                proprietaire: {
                    select: {
                        prenom: true,
                        nom: true,
                        telephone: true,
                        email: true,
                    },
                },
                vehicule: {
                    select: {
                        marque: true,
                        modele: true,
                        annee: true,
                        type: true,
                        immatriculation: true,
                        ville: true,
                    },
                },
            },
        });

        // ── 2. Delete old contract if regenerating ─────────────────────────
        if (reservation.contratPublicId) {
            this.logger.log(`Deleting old contract: ${reservation.contratPublicId}`);
            await this.cloudinary
                .deleteByPublicId(reservation.contratPublicId)
                .catch(() => { });
        }

        // ── 3. Build contract data ─────────────────────────────────────────
        const debut = new Date(reservation.dateDebut);
        const fin = new Date(reservation.dateFin);
        const nbJours = Math.round(
            (fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24),
        );

        const contractData: ContractData = {
            reservationId: reservation.id,
            dateContrat: new Date().toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            }),
            statutContrat: options.statutContrat,
            raisonAnnulation: options.raisonAnnulation,
            dateAnnulation: options.dateAnnulation,
            locataire: {
                prenom: reservation.locataire.prenom,
                nom: reservation.locataire.nom,
                telephone: reservation.locataire.telephone,
                email: reservation.locataire.email,
            },
            proprietaire: {
                prenom: reservation.proprietaire.prenom,
                nom: reservation.proprietaire.nom,
                telephone: reservation.proprietaire.telephone,
                email: reservation.proprietaire.email,
            },
            vehicule: {
                marque: reservation.vehicule.marque,
                modele: reservation.vehicule.modele,
                annee: reservation.vehicule.annee,
                type: reservation.vehicule.type,
                immatriculation: reservation.vehicule.immatriculation,
                ville: reservation.vehicule.ville,
            },
            tarifs: {
                dateDebut: debut.toLocaleDateString('fr-FR'),
                dateFin: fin.toLocaleDateString('fr-FR'),
                nbJours,
                prixParJour: reservation.prixParJour.toString(),
                totalBase: reservation.totalBase.toString(),
                commission: reservation.montantCommission.toString(),
                totalLocataire: reservation.totalLocataire.toString(),
                netProprietaire: reservation.netProprietaire.toString(),
            },
        };

        // ── 4. Generate PDF ────────────────────────────────────────────────
        const pdfBuffer = await this.pdfService.generate(contractData);
        this.logger.log(
            `Contract PDF [${options.statutContrat}] generated for ${reservationId} (${pdfBuffer.length} bytes)`,
        );

        // ── 5. Upload to Cloudinary ────────────────────────────────────────
        const upload = await this.cloudinary.uploadContract(pdfBuffer, reservationId);
        this.logger.log(`Contract uploaded: ${upload.url}`);

        // ── 6. Update reservation ──────────────────────────────────────────
        await this.prisma.reservation.update({
            where: { id: reservationId },
            data: {
                contratUrl: upload.url,
                contratPublicId: upload.publicId,
            },
        });

        return {
            contratUrl: upload.url,
            contratPublicId: upload.publicId,
        };
    }
}
