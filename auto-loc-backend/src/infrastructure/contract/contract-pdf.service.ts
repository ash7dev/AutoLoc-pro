import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

// ── Types ──────────────────────────────────────────────────────────────────────

export type StatutContrat = 'ACTIF' | 'ANNULE' | 'EXPIRE';

export interface ContractParty {
    prenom: string;
    nom: string;
    telephone: string;
    email: string;
}

export interface ContractVehicle {
    marque: string;
    modele: string;
    annee: number;
    type: string;
    immatriculation: string;
    ville: string;
}

export interface ContractPricing {
    dateDebut: string;
    dateFin: string;
    nbJours: number;
    prixParJour: string;
    totalBase: string;
    commission: string;
    totalLocataire: string;
    netProprietaire: string;
}

export interface ContractData {
    reservationId: string;
    dateContrat: string;
    statutContrat: StatutContrat;
    raisonAnnulation?: string;
    dateAnnulation?: string;
    locataire: ContractParty;
    proprietaire: ContractParty;
    vehicule: ContractVehicle;
    tarifs: ContractPricing;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const BRAND_COLOR = '#1a56db';
const TEXT_COLOR = '#1f2937';
const MUTED_COLOR = '#6b7280';
const BORDER_COLOR = '#e5e7eb';
const SUCCESS_COLOR = '#059669';
const DANGER_COLOR = '#dc2626';
const PAGE_MARGIN = 50;
const CONTENT_WIDTH = 595.28 - 2 * PAGE_MARGIN; // A4 width minus margins

// ── Service ────────────────────────────────────────────────────────────────────

@Injectable()
export class ContractPdfService {
    /**
     * Génère un contrat PDF complet et retourne le Buffer.
     */
    async generate(data: ContractData): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'A4',
                    margins: { top: 50, bottom: 50, left: PAGE_MARGIN, right: PAGE_MARGIN },
                    info: {
                        Title: `Contrat de location - ${data.reservationId}`,
                        Author: 'AutoLoc',
                        Subject: 'Contrat de location de véhicule',
                    },
                });

                const chunks: Buffer[] = [];
                doc.on('data', (chunk: Buffer) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                this.renderHeader(doc, data);
                this.renderStatusBadge(doc, data);
                this.renderParties(doc, data);
                this.renderVehicle(doc, data);
                this.renderPricing(doc, data);
                this.renderCancellationPolicy(doc);
                this.renderGeneralConditions(doc);
                this.renderSignatures(doc, data);
                this.renderFooter(doc);

                // Watermark on every page for cancelled/expired contracts
                if (data.statutContrat !== 'ACTIF') {
                    this.renderWatermark(doc, data);
                }

                doc.end();
            } catch (err) {
                reject(err);
            }
        });
    }

    // ── Status & Watermark ─────────────────────────────────────────────────────

    private renderStatusBadge(doc: PDFKit.PDFDocument, data: ContractData): void {
        const badgeY = 42;
        const badgeX = PAGE_MARGIN + CONTENT_WIDTH - 130;

        if (data.statutContrat === 'ACTIF') {
            // Green badge
            doc.roundedRect(badgeX, badgeY, 120, 22, 4)
                .fill(SUCCESS_COLOR);
            doc.fontSize(9)
                .fillColor('#ffffff')
                .font('Helvetica-Bold')
                .text('CONTRAT ACTIF', badgeX + 10, badgeY + 6, { width: 100, align: 'center' });
        } else {
            // Red badge
            const label = data.statutContrat === 'EXPIRE'
                ? 'ANNULÉ — EXPIRÉ'
                : 'CONTRAT ANNULÉ';
            doc.roundedRect(badgeX, badgeY, 120, 22, 4)
                .fill(DANGER_COLOR);
            doc.fontSize(8)
                .fillColor('#ffffff')
                .font('Helvetica-Bold')
                .text(label, badgeX + 4, badgeY + 6, { width: 112, align: 'center' });
        }

        // Cancellation info box
        if (data.statutContrat !== 'ACTIF') {
            const boxY = 155;
            doc.roundedRect(PAGE_MARGIN, boxY, CONTENT_WIDTH, 40, 3)
                .fillAndStroke('#fef2f2', DANGER_COLOR);

            doc.fontSize(8)
                .fillColor(DANGER_COLOR)
                .font('Helvetica-Bold')
                .text(
                    data.statutContrat === 'EXPIRE'
                        ? '⚠ Ce contrat a été annulé suite à l\'expiration du délai de paiement.'
                        : '⚠ Ce contrat a été annulé.',
                    PAGE_MARGIN + 10,
                    boxY + 8,
                    { width: CONTENT_WIDTH - 20 },
                );

            const detailParts: string[] = [];
            if (data.dateAnnulation) detailParts.push(`Date : ${data.dateAnnulation}`);
            if (data.raisonAnnulation) detailParts.push(`Raison : ${data.raisonAnnulation}`);

            if (detailParts.length > 0) {
                doc.fontSize(7.5)
                    .fillColor(TEXT_COLOR)
                    .font('Helvetica')
                    .text(detailParts.join(' — '), PAGE_MARGIN + 10, boxY + 22, {
                        width: CONTENT_WIDTH - 20,
                    });
            }

            doc.y = boxY + 50;
        }
    }

    private renderWatermark(doc: PDFKit.PDFDocument, data: ContractData): void {
        const pageCount = doc.bufferedPageRange().count;

        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            doc.save();

            // Diagonal watermark text
            const pageWidth = doc.page.width;
            const pageHeight = doc.page.height;
            const centerX = pageWidth / 2;
            const centerY = pageHeight / 2;

            doc.translate(centerX, centerY);
            doc.rotate(-45, { origin: [0, 0] });

            doc.fontSize(72)
                .fillColor(DANGER_COLOR)
                .opacity(0.12)
                .font('Helvetica-Bold')
                .text(
                    data.statutContrat === 'EXPIRE' ? 'EXPIRÉ' : 'ANNULÉ',
                    -200,
                    -30,
                    { width: 400, align: 'center' },
                );

            doc.restore();
            doc.opacity(1);
        }
    }

    // ── Sections ───────────────────────────────────────────────────────────────

    private renderHeader(doc: PDFKit.PDFDocument, data: ContractData): void {
        doc.fontSize(28)
            .fillColor(BRAND_COLOR)
            .font('Helvetica-Bold')
            .text('AutoLoc', PAGE_MARGIN, 40, { align: 'left' });

        doc.fontSize(10)
            .fillColor(MUTED_COLOR)
            .font('Helvetica')
            .text('Plateforme de location de véhicules', PAGE_MARGIN, 72);

        doc.fontSize(11)
            .fillColor(TEXT_COLOR)
            .font('Helvetica-Bold')
            .text('CONTRAT DE LOCATION DE VÉHICULE', PAGE_MARGIN, 100, { align: 'center' });

        doc.fontSize(9)
            .fillColor(MUTED_COLOR)
            .font('Helvetica')
            .text(`Référence : ${data.reservationId}`, PAGE_MARGIN, 118, { align: 'center' })
            .text(`Date d'établissement : ${data.dateContrat}`, PAGE_MARGIN, 130, { align: 'center' });

        doc.moveTo(PAGE_MARGIN, 148)
            .lineTo(PAGE_MARGIN + CONTENT_WIDTH, 148)
            .strokeColor(BORDER_COLOR)
            .lineWidth(1)
            .stroke();

        doc.y = 160;
    }

    private renderParties(doc: PDFKit.PDFDocument, data: ContractData): void {
        this.sectionTitle(doc, 'ARTICLE 1 — LES PARTIES');

        const midX = PAGE_MARGIN + CONTENT_WIDTH / 2;
        const startY = doc.y;

        doc.fontSize(9).fillColor(BRAND_COLOR).font('Helvetica-Bold')
            .text('LE LOCATAIRE', PAGE_MARGIN, startY);
        doc.fontSize(8).fillColor(TEXT_COLOR).font('Helvetica')
            .text(`Nom : ${data.locataire.prenom} ${data.locataire.nom}`, PAGE_MARGIN, startY + 16)
            .text(`Téléphone : ${data.locataire.telephone}`, PAGE_MARGIN, startY + 28)
            .text(`Email : ${data.locataire.email}`, PAGE_MARGIN, startY + 40);

        doc.fontSize(9).fillColor(BRAND_COLOR).font('Helvetica-Bold')
            .text('LE PROPRIÉTAIRE', midX + 10, startY);
        doc.fontSize(8).fillColor(TEXT_COLOR).font('Helvetica')
            .text(`Nom : ${data.proprietaire.prenom} ${data.proprietaire.nom}`, midX + 10, startY + 16)
            .text(`Téléphone : ${data.proprietaire.telephone}`, midX + 10, startY + 28)
            .text(`Email : ${data.proprietaire.email}`, midX + 10, startY + 40);

        doc.y = startY + 60;
    }

    private renderVehicle(doc: PDFKit.PDFDocument, data: ContractData): void {
        this.sectionTitle(doc, 'ARTICLE 2 — VÉHICULE');
        const v = data.vehicule;
        this.renderKeyValueList(doc, [
            ['Marque / Modèle', `${v.marque} ${v.modele} (${v.annee})`],
            ['Type', v.type],
            ['Immatriculation', v.immatriculation],
            ['Ville de prise en charge', v.ville],
        ]);
    }

    private renderPricing(doc: PDFKit.PDFDocument, data: ContractData): void {
        this.sectionTitle(doc, 'ARTICLE 3 — DURÉE ET TARIFS');
        const t = data.tarifs;
        this.renderKeyValueList(doc, [
            ['Date de début', t.dateDebut],
            ['Date de fin', t.dateFin],
            ['Durée', `${t.nbJours} jour(s)`],
            ['Prix par jour', `${t.prixParJour} FCFA`],
            ['Sous-total', `${t.totalBase} FCFA`],
            ['Frais de service (15%)', `${t.commission} FCFA`],
            ['Total à payer (locataire)', `${t.totalLocataire} FCFA`],
            ['Revenu propriétaire', `${t.netProprietaire} FCFA`],
        ]);
    }

    private renderCancellationPolicy(doc: PDFKit.PDFDocument): void {
        this.sectionTitle(doc, 'ARTICLE 4 — POLITIQUE D\'ANNULATION');
        const y = doc.y;

        doc.fontSize(8).fillColor(BRAND_COLOR).font('Helvetica-Bold')
            .text('Annulation par le locataire :', PAGE_MARGIN, y);
        doc.fontSize(7.5).fillColor(TEXT_COLOR).font('Helvetica')
            .text('• Plus de 5 jours avant : remboursement à 100% (frais de service retenus)', PAGE_MARGIN + 10, y + 12)
            .text('• Entre 2 et 5 jours : remboursement à 75%', PAGE_MARGIN + 10, y + 22)
            .text('• Moins de 24 heures : aucun remboursement', PAGE_MARGIN + 10, y + 32);

        doc.fontSize(8).fillColor(BRAND_COLOR).font('Helvetica-Bold')
            .text('Annulation par le propriétaire :', PAGE_MARGIN, y + 50);
        doc.fontSize(7.5).fillColor(TEXT_COLOR).font('Helvetica')
            .text('• Plus de 7 jours : remboursement intégral client, avertissement', PAGE_MARGIN + 10, y + 62)
            .text('• 3–7 jours : remboursement intégral + pénalité 20%', PAGE_MARGIN + 10, y + 72)
            .text('• Moins de 3 jours : remboursement intégral + pénalité 40%', PAGE_MARGIN + 10, y + 82)
            .text('• Jour même : annulation impossible sauf accord mutuel', PAGE_MARGIN + 10, y + 92);

        doc.fontSize(7.5).fillColor(MUTED_COLOR).font('Helvetica-Oblique')
            .text(
                'Exceptions : panne mécanique, accident/maladie grave, décès famille proche, force majeure → remboursement intégral.',
                PAGE_MARGIN, y + 110, { width: CONTENT_WIDTH },
            );
        doc.y = y + 130;
    }

    private renderGeneralConditions(doc: PDFKit.PDFDocument): void {
        if (doc.y > 580) doc.addPage();
        this.sectionTitle(doc, 'ARTICLE 5 — CONDITIONS GÉNÉRALES');

        const conditions = [
            'Le locataire s\'engage à utiliser le véhicule en bon père de famille et à le restituer dans l\'état initial.',
            'Le véhicule doit être restitué à la date et au lieu convenus. Tout retard sera facturé au prix journalier majoré de 50%.',
            'Le locataire est responsable de toute infraction au code de la route commise pendant la durée de la location.',
            'En cas de panne ou d\'accident, le locataire doit immédiatement prévenir le propriétaire et la plateforme AutoLoc.',
            'Le propriétaire garantit que le véhicule est en bon état de fonctionnement, assuré et dispose d\'une visite technique valide.',
            'Tout litige sera soumis à la médiation de la plateforme AutoLoc avant toute action judiciaire.',
            'Le présent contrat est régi par le droit en vigueur au Sénégal.',
        ];

        const y = doc.y;
        conditions.forEach((cond, i) => {
            doc.fontSize(7.5).fillColor(TEXT_COLOR).font('Helvetica')
                .text(`${i + 1}. ${cond}`, PAGE_MARGIN, y + i * 14, { width: CONTENT_WIDTH });
        });
        doc.y = y + conditions.length * 14 + 10;
    }

    private renderSignatures(doc: PDFKit.PDFDocument, data: ContractData): void {
        if (doc.y > 650) doc.addPage();
        this.sectionTitle(doc, 'SIGNATURES');

        const midX = PAGE_MARGIN + CONTENT_WIDTH / 2;
        const y = doc.y;

        doc.fontSize(8).fillColor(TEXT_COLOR).font('Helvetica-Bold')
            .text('Le locataire', PAGE_MARGIN, y)
            .font('Helvetica')
            .text(`${data.locataire.prenom} ${data.locataire.nom}`, PAGE_MARGIN, y + 12);
        doc.moveTo(PAGE_MARGIN, y + 50).lineTo(PAGE_MARGIN + 180, y + 50).strokeColor(BORDER_COLOR).stroke();
        doc.fontSize(7).fillColor(MUTED_COLOR).text('Signature', PAGE_MARGIN, y + 55);

        doc.fontSize(8).fillColor(TEXT_COLOR).font('Helvetica-Bold')
            .text('Le propriétaire', midX + 10, y)
            .font('Helvetica')
            .text(`${data.proprietaire.prenom} ${data.proprietaire.nom}`, midX + 10, y + 12);
        doc.moveTo(midX + 10, y + 50).lineTo(midX + 190, y + 50).strokeColor(BORDER_COLOR).stroke();
        doc.fontSize(7).fillColor(MUTED_COLOR).text('Signature', midX + 10, y + 55);

        doc.y = y + 75;
    }

    private renderFooter(doc: PDFKit.PDFDocument): void {
        const bottomY = doc.page.height - 40;
        doc.fontSize(6.5).fillColor(MUTED_COLOR).font('Helvetica')
            .text(
                'AutoLoc — Plateforme de location de véhicules au Sénégal. Ce contrat est généré automatiquement et fait office de preuve de la réservation.',
                PAGE_MARGIN, bottomY, { align: 'center', width: CONTENT_WIDTH },
            );
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private sectionTitle(doc: PDFKit.PDFDocument, title: string): void {
        const y = doc.y + 8;
        doc.fontSize(9.5).fillColor(BRAND_COLOR).font('Helvetica-Bold')
            .text(title, PAGE_MARGIN, y);
        doc.moveTo(PAGE_MARGIN, y + 14).lineTo(PAGE_MARGIN + CONTENT_WIDTH, y + 14)
            .strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();
        doc.y = y + 22;
    }

    private renderKeyValueList(doc: PDFKit.PDFDocument, items: string[][]): void {
        const startY = doc.y;
        items.forEach(([key, value], i) => {
            const rowY = startY + i * 14;
            doc.fontSize(8).fillColor(MUTED_COLOR).font('Helvetica').text(key, PAGE_MARGIN + 10, rowY);
            doc.fontSize(8).fillColor(TEXT_COLOR).font('Helvetica-Bold').text(value, PAGE_MARGIN + 180, rowY);
        });
        doc.y = startY + items.length * 14 + 5;
    }
}
