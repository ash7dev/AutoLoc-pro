import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

// ── Types ──────────────────────────────────────────────────────────────────────

export type StatutContrat = 'EN_COURS' | 'ACTIF' | 'ANNULE' | 'EXPIRE';

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

// ── Layout constants ───────────────────────────────────────────────────────────

const M = 48;                          // page margin
const PW = 595.28;                     // A4 width
const CW = PW - M * 2;                // content width

// Palette — inspired by Stripe / DocuSign
const C = {
    ink:        '#0F172A',  // headings, labels
    body:       '#374151',  // body text
    muted:      '#6B7280',  // captions, placeholders
    border:     '#E5E7EB',  // dividers
    surface:    '#F9FAFB',  // row backgrounds
    emerald:    '#059669',  // brand accent (totals, success)
    emeraldBg:  '#ECFDF5',  // light emerald background
    amber:      '#D97706',  // warning
    amberBg:    '#FFFBEB',
    red:        '#DC2626',  // danger
    redBg:      '#FEF2F2',
    accentLine: '#10B981',  // thin decorative line
};

// ── Service ────────────────────────────────────────────────────────────────────

@Injectable()
export class ContractPdfService {

    private readonly logoPath = path.join(__dirname, 'logo.jpg');

    async generate(data: ContractData): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'A4',
                    bufferPages: true,
                    margins: { top: M, bottom: M, left: M, right: M },
                    info: {
                        Title: `Contrat de location AutoLoc — ${data.reservationId.slice(0, 8).toUpperCase()}`,
                        Author: 'AutoLoc',
                        Subject: 'Contrat de location de véhicule',
                        Creator: 'AutoLoc Platform',
                    },
                });

                const chunks: Buffer[] = [];
                doc.on('data', (c: Buffer) => chunks.push(c));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                this.renderHeader(doc, data);
                this.renderStatusBanner(doc, data);
                this.renderParties(doc, data);
                this.renderVehicle(doc, data);
                this.renderPricing(doc, data);
                this.renderCancellationPolicy(doc);
                this.renderConditions(doc);
                this.renderSignatures(doc, data);
                this.renderFooter(doc, data);

                if (data.statutContrat === 'ANNULE' || data.statutContrat === 'EXPIRE') {
                    this.renderWatermark(doc, data.statutContrat);
                }

                doc.end();
            } catch (err) {
                reject(err);
            }
        });
    }

    // ── Header ─────────────────────────────────────────────────────────────────

    private renderHeader(doc: PDFKit.PDFDocument, data: ContractData): void {
        const ref = data.reservationId.slice(0, 8).toUpperCase();

        // Logo (left)
        const logoExists = fs.existsSync(this.logoPath);
        if (logoExists) {
            doc.image(this.logoPath, M, 36, { height: 38, fit: [140, 38] });
        } else {
            // Fallback text logo
            doc.fontSize(20).fillColor(C.emerald).font('Helvetica-Bold')
                .text('AutoLoc', M, 42);
        }

        // Contract title (right-aligned)
        doc.fontSize(9).fillColor(C.muted).font('Helvetica')
            .text('CONTRAT DE LOCATION DE VÉHICULE', M, 38, { width: CW, align: 'right' });
        doc.fontSize(18).fillColor(C.ink).font('Helvetica-Bold')
            .text(`N° ${ref}`, M, 50, { width: CW, align: 'right' });
        doc.fontSize(8).fillColor(C.muted).font('Helvetica')
            .text(`Établi le ${data.dateContrat}`, M, 72, { width: CW, align: 'right' });

        // Thin emerald accent line
        doc.moveTo(M, 88).lineTo(M + CW, 88)
            .strokeColor(C.accentLine).lineWidth(2).stroke();

        doc.y = 100;
    }

    // ── Status banner ──────────────────────────────────────────────────────────

    private renderStatusBanner(doc: PDFKit.PDFDocument, data: ContractData): void {
        const { statutContrat } = data;

        let bg: string, border: string, text: string, label: string, desc: string;

        if (statutContrat === 'ACTIF') {
            bg = C.emeraldBg; border = C.emerald; text = C.emerald;
            label = '✓  Contrat actif';
            desc = 'Ce contrat est en vigueur. Les deux parties ont accepté les conditions.';
        } else if (statutContrat === 'EN_COURS') {
            bg = C.amberBg; border = C.amber; text = C.amber;
            label = '⏳  En attente de confirmation';
            desc = 'En attente de la confirmation du propriétaire. Les coordonnées seront visibles après confirmation.';
        } else {
            bg = C.redBg; border = C.red; text = C.red;
            label = statutContrat === 'EXPIRE' ? '✕  Contrat expiré' : '✕  Contrat annulé';
            desc = statutContrat === 'EXPIRE'
                ? 'Ce contrat a été annulé suite à l\'expiration du délai de paiement.'
                : `Annulé${data.dateAnnulation ? ` le ${data.dateAnnulation}` : ''}${data.raisonAnnulation ? ` — ${data.raisonAnnulation}` : ''}.`;
        }

        const bannerH = 36;
        doc.roundedRect(M, doc.y, CW, bannerH, 6)
            .fillColor(bg).fill();
        doc.roundedRect(M, doc.y, CW, bannerH, 6)
            .strokeColor(border).lineWidth(0.75).stroke();

        // Left color accent
        doc.rect(M, doc.y, 3.5, bannerH)
            .fillColor(border).fill();

        const bannerY = doc.y;
        doc.fontSize(9).fillColor(text).font('Helvetica-Bold')
            .text(label, M + 14, bannerY + 7, { width: CW - 20 });
        doc.fontSize(7.5).fillColor(C.body).font('Helvetica')
            .text(desc, M + 14, bannerY + 20, { width: CW - 20 });

        doc.y = bannerY + bannerH + 16;
    }

    // ── Parties ────────────────────────────────────────────────────────────────

    private renderParties(doc: PDFKit.PDFDocument, data: ContractData): void {
        this.sectionTitle(doc, 'LES PARTIES');

        const colW = (CW - 12) / 2;
        const startY = doc.y;

        // Locataire card
        doc.roundedRect(M, startY, colW, 90, 5)
            .fillColor(C.surface).fill();
        doc.roundedRect(M, startY, colW, 90, 5)
            .strokeColor(C.border).lineWidth(0.5).stroke();

        doc.fontSize(7).fillColor(C.muted).font('Helvetica-Bold')
            .text('LOCATAIRE', M + 12, startY + 10, { width: colW - 24, characterSpacing: 0.8 });
        doc.fontSize(10).fillColor(C.ink).font('Helvetica-Bold')
            .text(`${data.locataire.prenom} ${data.locataire.nom}`, M + 12, startY + 22, { width: colW - 24 });
        doc.fontSize(8).fillColor(C.body).font('Helvetica')
            .text(data.locataire.telephone || '—', M + 12, startY + 38, { width: colW - 24 })
            .text(data.locataire.email || '—', M + 12, startY + 50, { width: colW - 24 });

        // Proprietaire card
        const col2X = M + colW + 12;
        doc.roundedRect(col2X, startY, colW, 90, 5)
            .fillColor(C.surface).fill();
        doc.roundedRect(col2X, startY, colW, 90, 5)
            .strokeColor(C.border).lineWidth(0.5).stroke();

        doc.fontSize(7).fillColor(C.muted).font('Helvetica-Bold')
            .text('PROPRIÉTAIRE', col2X + 12, startY + 10, { width: colW - 24, characterSpacing: 0.8 });
        doc.fontSize(10).fillColor(C.ink).font('Helvetica-Bold')
            .text(`${data.proprietaire.prenom} ${data.proprietaire.nom}`, col2X + 12, startY + 22, { width: colW - 24 });
        doc.fontSize(8).fillColor(C.body).font('Helvetica')
            .text(data.proprietaire.telephone || '—', col2X + 12, startY + 38, { width: colW - 24 })
            .text(data.proprietaire.email || '—', col2X + 12, startY + 50, { width: colW - 24 });

        doc.y = startY + 90 + 16;
    }

    // ── Vehicle ────────────────────────────────────────────────────────────────

    private renderVehicle(doc: PDFKit.PDFDocument, data: ContractData): void {
        this.sectionTitle(doc, 'VÉHICULE');

        const v = data.vehicule;
        const startY = doc.y;

        doc.roundedRect(M, startY, CW, 60, 5)
            .fillColor(C.surface).fill();
        doc.roundedRect(M, startY, CW, 60, 5)
            .strokeColor(C.border).lineWidth(0.5).stroke();

        const col = CW / 4;
        const items = [
            ['VÉHICULE', `${v.marque} ${v.modele} (${v.annee})`],
            ['TYPE', v.type],
            ['IMMATRICULATION', v.immatriculation || '—'],
            ['VILLE', v.ville],
        ];

        items.forEach(([label, value], i) => {
            const x = M + i * col + 12;
            doc.fontSize(7).fillColor(C.muted).font('Helvetica-Bold')
                .text(label, x, startY + 10, { width: col - 16, characterSpacing: 0.6 });
            doc.fontSize(9).fillColor(C.ink).font('Helvetica-Bold')
                .text(value, x, startY + 24, { width: col - 16 });
        });

        doc.y = startY + 60 + 16;
    }

    // ── Pricing ────────────────────────────────────────────────────────────────

    private renderPricing(doc: PDFKit.PDFDocument, data: ContractData): void {
        this.sectionTitle(doc, 'DURÉE & TARIFS');

        const t = data.tarifs;
        const rowH = 22;
        const startY = doc.y;

        // Date summary bar
        doc.roundedRect(M, startY, CW, 32, 5)
            .fillColor(C.surface).fill();
        doc.roundedRect(M, startY, CW, 32, 5)
            .strokeColor(C.border).lineWidth(0.5).stroke();

        const col = CW / 3;
        const dateCols = [
            ['DÉBUT', t.dateDebut],
            ['FIN', t.dateFin],
            ['DURÉE', `${t.nbJours} jour${t.nbJours > 1 ? 's' : ''}`],
        ];
        dateCols.forEach(([label, value], i) => {
            const x = M + i * col + 12;
            doc.fontSize(7).fillColor(C.muted).font('Helvetica-Bold')
                .text(label, x, startY + 5, { characterSpacing: 0.6 });
            doc.fontSize(9).fillColor(C.ink).font('Helvetica-Bold')
                .text(value, x, startY + 16);
        });

        doc.y = startY + 32 + 10;

        // Pricing table
        const tableY = doc.y;
        const rows: Array<{ label: string; value: string; bold?: boolean; accent?: boolean; bg?: string }> = [
            { label: `Prix journalier × ${t.nbJours} jour${t.nbJours > 1 ? 's' : ''}`, value: `${Number(t.totalBase).toLocaleString('fr-FR')} FCFA` },
            { label: 'Frais de service AutoLoc (15%)', value: `${Number(t.commission).toLocaleString('fr-FR')} FCFA` },
            { label: 'Total réglé par le locataire', value: `${Number(t.totalLocataire).toLocaleString('fr-FR')} FCFA`, bold: true, bg: C.surface },
            { label: 'Revenu net propriétaire', value: `${Number(t.netProprietaire).toLocaleString('fr-FR')} FCFA`, bold: true, accent: true, bg: C.emeraldBg },
        ];

        rows.forEach((row, i) => {
            const y = tableY + i * rowH;
            const bg = row.bg ?? (i % 2 === 0 ? '#FFFFFF' : C.surface);
            doc.rect(M, y, CW, rowH).fillColor(bg).fill();
            doc.rect(M, y, CW, rowH).strokeColor(C.border).lineWidth(0.3).stroke();

            const font = row.bold ? 'Helvetica-Bold' : 'Helvetica';
            const textColor = row.accent ? C.emerald : C.body;

            doc.fontSize(8.5).fillColor(C.body).font(font)
                .text(row.label, M + 14, y + 7, { width: CW - 120 });
            doc.fontSize(8.5).fillColor(textColor).font('Helvetica-Bold')
                .text(row.value, M + CW - 110, y + 7, { width: 100, align: 'right' });
        });

        doc.y = tableY + rows.length * rowH + 16;
    }

    // ── Cancellation policy ────────────────────────────────────────────────────

    private renderCancellationPolicy(doc: PDFKit.PDFDocument): void {
        if (doc.y > 560) doc.addPage();
        this.sectionTitle(doc, 'POLITIQUE D\'ANNULATION');

        const startY = doc.y;
        const colW = (CW - 12) / 2;

        const blocks: Array<{ title: string; items: string[] }> = [
            {
                title: 'Par le locataire',
                items: [
                    '> 5 jours avant le début : remboursement 100%',
                    '2 à 5 jours : remboursement 75%',
                    '< 24h : aucun remboursement',
                ],
            },
            {
                title: 'Par le propriétaire',
                items: [
                    '> 7 jours : remboursement intégral',
                    '3–7 jours : remboursement + pénalité 20%',
                    '< 3 jours : remboursement + pénalité 40%',
                ],
            },
        ];

        blocks.forEach((block, i) => {
            const x = i === 0 ? M : M + colW + 12;
            const lineH = 13;
            const boxH = 16 + block.items.length * lineH + 8;

            doc.roundedRect(x, startY, colW, boxH, 5)
                .fillColor(C.surface).fill();
            doc.roundedRect(x, startY, colW, boxH, 5)
                .strokeColor(C.border).lineWidth(0.5).stroke();

            doc.fontSize(8).fillColor(C.ink).font('Helvetica-Bold')
                .text(block.title, x + 12, startY + 8, { width: colW - 24 });

            block.items.forEach((item, j) => {
                doc.fontSize(7.5).fillColor(C.body).font('Helvetica')
                    .text(`• ${item}`, x + 12, startY + 22 + j * lineH, { width: colW - 24 });
            });
        });

        doc.y = startY + 16 + 3 * 13 + 8 + 16;
    }

    // ── General conditions ─────────────────────────────────────────────────────

    private renderConditions(doc: PDFKit.PDFDocument): void {
        if (doc.y > 580) doc.addPage();
        this.sectionTitle(doc, 'CONDITIONS GÉNÉRALES');

        const conditions = [
            'Le locataire s\'engage à utiliser le véhicule en bon père de famille et à le restituer dans l\'état initial.',
            'Tout retard de restitution sera facturé au prix journalier majoré de 50%, sauf accord préalable.',
            'Le locataire est responsable des infractions commises pendant la durée de la location.',
            'En cas de panne ou d\'accident, le locataire prévient immédiatement le propriétaire et AutoLoc.',
            'Le propriétaire garantit que le véhicule est en bon état, assuré et dispose d\'une visite technique valide.',
            'Tout litige est soumis à la médiation d\'AutoLoc avant toute action judiciaire.',
            'Le présent contrat est régi par le droit en vigueur au Sénégal.',
        ];

        const startY = doc.y;
        conditions.forEach((item, i) => {
            doc.fontSize(7.5).fillColor(C.body).font('Helvetica')
                .text(`${i + 1}.  ${item}`, M + 8, startY + i * 14, { width: CW - 8 });
        });

        doc.y = startY + conditions.length * 14 + 16;
    }

    // ── Signatures ─────────────────────────────────────────────────────────────

    private renderSignatures(doc: PDFKit.PDFDocument, data: ContractData): void {
        if (doc.y > 630) doc.addPage();
        this.sectionTitle(doc, 'SIGNATURES');

        const colW = (CW - 16) / 2;
        const startY = doc.y;
        const boxH = 88;

        const parties = [
            { label: 'LE LOCATAIRE', name: `${data.locataire.prenom} ${data.locataire.nom}`, x: M },
            { label: 'LE PROPRIÉTAIRE', name: `${data.proprietaire.prenom} ${data.proprietaire.nom}`, x: M + colW + 16 },
        ];

        parties.forEach(({ label, name, x }) => {
            doc.roundedRect(x, startY, colW, boxH, 5)
                .fillColor('#FFFFFF').fill();
            doc.roundedRect(x, startY, colW, boxH, 5)
                .strokeColor(C.border).lineWidth(0.5).stroke();

            doc.fontSize(7).fillColor(C.muted).font('Helvetica-Bold')
                .text(label, x + 12, startY + 8, { width: colW - 24, characterSpacing: 0.7 });
            doc.fontSize(8.5).fillColor(C.ink).font('Helvetica-Bold')
                .text(name, x + 12, startY + 20, { width: colW - 24 });
            doc.fontSize(7.5).fillColor(C.muted).font('Helvetica')
                .text('Lu et approuvé — Bon pour accord', x + 12, startY + 34, { width: colW - 24 });

            // Signature line
            doc.moveTo(x + 12, startY + 66).lineTo(x + colW - 12, startY + 66)
                .strokeColor(C.border).lineWidth(1).stroke();
            doc.fontSize(7).fillColor(C.muted).font('Helvetica')
                .text('Signature', x + 12, startY + 70, { width: 60 });

            // Date field
            doc.moveTo(x + colW - 80, startY + 66).lineTo(x + colW - 12, startY + 66)
                .strokeColor(C.border).lineWidth(1).stroke();
            doc.fontSize(7).fillColor(C.muted).font('Helvetica')
                .text('Date', x + colW - 80, startY + 70, { width: 40 });
        });

        doc.y = startY + boxH + 16;
    }

    // ── Footer ─────────────────────────────────────────────────────────────────

    private renderFooter(doc: PDFKit.PDFDocument, data: ContractData): void {
        const y = doc.page.height - 36;
        const ref = data.reservationId.slice(0, 8).toUpperCase();

        doc.moveTo(M, y - 8).lineTo(M + CW, y - 8)
            .strokeColor(C.border).lineWidth(0.5).stroke();

        doc.fontSize(6.5).fillColor(C.muted).font('Helvetica')
            .text(`AutoLoc — Plateforme de location de véhicules entre particuliers au Sénégal  ·  Réf. ${ref}  ·  ${data.dateContrat}`,
                M, y, { width: CW, align: 'center' });
    }

    // ── Watermark ──────────────────────────────────────────────────────────────

    private renderWatermark(doc: PDFKit.PDFDocument, statut: StatutContrat): void {
        const pageCount = doc.bufferedPageRange().count;
        const label = statut === 'EXPIRE' ? 'EXPIRÉ' : 'ANNULÉ';

        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            doc.save();
            doc.translate(PW / 2, 420);
            doc.rotate(-42, { origin: [0, 0] });
            doc.fontSize(88).fillColor(C.red).opacity(0.07).font('Helvetica-Bold')
                .text(label, -180, -44, { width: 360, align: 'center' });
            doc.restore();
            doc.opacity(1);
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private sectionTitle(doc: PDFKit.PDFDocument, title: string): void {
        const y = doc.y + 4;
        doc.fontSize(7.5).fillColor(C.muted).font('Helvetica-Bold')
            .text(title, M, y, { characterSpacing: 1.2 });

        // Thin line after the text
        const textW = doc.widthOfString(title) + 10;
        doc.moveTo(M + textW, y + 5).lineTo(M + CW, y + 5)
            .strokeColor(C.border).lineWidth(0.5).stroke();

        doc.y = y + 16;
    }
}
