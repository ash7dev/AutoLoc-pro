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
        const rows: Array<{ label: string; value: string; bold?: boolean; accent?: boolean; bg?: string; large?: boolean }> = [
            { label: `Prix journalier (${Number(t.prixParJour).toLocaleString('fr-FR')} FCFA) × ${t.nbJours} jour${t.nbJours > 1 ? 's' : ''}`, value: `${Number(t.totalBase).toLocaleString('fr-FR')} FCFA` },
            { label: 'Frais de service AutoLoc (15 %)', value: `${Number(t.commission).toLocaleString('fr-FR')} FCFA` },
            { label: 'Total réglé par le locataire', value: `${Number(t.totalLocataire).toLocaleString('fr-FR')} FCFA`, bold: true, bg: C.surface, large: true },
            { label: 'Revenu net du propriétaire', value: `${Number(t.netProprietaire).toLocaleString('fr-FR')} FCFA`, bold: true, accent: true, bg: C.emeraldBg, large: true },
        ];

        rows.forEach((row, i) => {
            const rh = row.large ? rowH + 6 : rowH;
            const y = tableY + rows.slice(0, i).reduce((acc, r) => acc + (r.large ? rowH + 6 : rowH), 0);
            const bg = row.bg ?? (i % 2 === 0 ? '#FFFFFF' : C.surface);
            doc.rect(M, y, CW, rh).fillColor(bg).fill();
            doc.rect(M, y, CW, rh).strokeColor(C.border).lineWidth(0.3).stroke();

            const labelFont = row.bold ? 'Helvetica-Bold' : 'Helvetica';
            const textColor = row.accent ? C.emerald : C.body;
            const labelSize = row.large ? 9 : 8.5;
            const valueSize = row.large ? 12 : 9;
            const vPad = Math.floor((rh - labelSize) / 2) - 1;

            doc.fontSize(labelSize).fillColor(C.body).font(labelFont)
                .text(row.label, M + 14, y + vPad, { width: CW - 130 });
            doc.fontSize(valueSize).fillColor(textColor).font('Helvetica-Bold')
                .text(row.value, M + CW - 125, y + Math.floor((rh - valueSize) / 2) - 1, { width: 115, align: 'right' });
        });

        const totalRowH = rows.reduce((acc, r) => acc + (r.large ? rowH + 6 : rowH), 0);
        doc.y = tableY + totalRowH + 16;
    }

    // ── Cancellation policy ────────────────────────────────────────────────────

    private renderCancellationPolicy(doc: PDFKit.PDFDocument): void {
        if (doc.y > 530) doc.addPage();
        this.sectionTitle(doc, 'POLITIQUE D\'ANNULATION');

        const startY = doc.y;
        const colW = (CW - 12) / 2;

        const blocks: Array<{ title: string; paras: string[] }> = [
            {
                title: 'Annulation par le locataire',
                paras: [
                    'Plus de 5 jours avant le début de la location : le locataire est remboursé intégralement du montant versé, déduction faite des frais de service AutoLoc.',
                    'Entre 2 et 5 jours avant le début : le remboursement s\'élève à 75 % du montant total réglé. Les 25 % restants sont retenus à titre d\'indemnisation.',
                    'Moins de 24 heures avant le début : aucun remboursement ne peut être accordé. Le montant intégral est acquis.',
                ],
            },
            {
                title: 'Annulation par le propriétaire',
                paras: [
                    'Plus de 7 jours avant le début de la location : le locataire est remboursé intégralement, sans pénalité pour le propriétaire.',
                    'Entre 3 et 7 jours avant le début : en plus du remboursement intégral du locataire, une pénalité de 20 % est appliquée au propriétaire.',
                    'Moins de 3 jours avant le début : le locataire est remboursé et une pénalité de 40 % est mise à la charge du propriétaire.',
                ],
            },
        ];

        blocks.forEach((block, i) => {
            const x = i === 0 ? M : M + colW + 12;
            const lineH = 11.5;
            const textWidth = colW - 28;
            // Estimate height: title + 3 paras × approx 3 lines each
            const boxH = 18 + block.paras.length * (lineH * 3.2) + 8;

            doc.roundedRect(x, startY, colW, boxH, 5)
                .fillColor(C.surface).fill();
            doc.roundedRect(x, startY, colW, boxH, 5)
                .strokeColor(C.border).lineWidth(0.5).stroke();

            doc.fontSize(8.5).fillColor(C.ink).font('Helvetica-Bold')
                .text(block.title, x + 12, startY + 10, { width: textWidth });

            let paraY = startY + 24;
            block.paras.forEach((para) => {
                doc.fontSize(7.5).fillColor(C.body).font('Helvetica')
                    .text(para, x + 12, paraY, { width: textWidth, lineGap: 1.5 });
                paraY = doc.y + 5;
            });
        });

        // Move doc.y past the taller block
        doc.y = startY + 18 + blocks[0].paras.length * (11.5 * 3.2) + 8 + 16;
    }

    // ── General conditions ─────────────────────────────────────────────────────

    private renderConditions(doc: PDFKit.PDFDocument): void {
        if (doc.y > 480) doc.addPage();
        this.sectionTitle(doc, 'CONDITIONS GÉNÉRALES');

        const articles: Array<{ label: string; items: string[] }> = [
            {
                label: 'Article 3 — Obligations du propriétaire',
                items: [
                    'Le propriétaire met à disposition le véhicule en parfait état de fonctionnement, propre et avec le niveau de carburant convenu, à la date et heure de début de la location.',
                    'Il garantit que le véhicule est couvert par une assurance valide incluant la location à des tiers et fournit tous les documents de circulation (carte grise, attestation d\'assurance).',
                ],
            },
            {
                label: 'Article 4 — Obligations du locataire',
                items: [
                    'Le locataire s\'engage à utiliser le véhicule en bon père de famille, dans le respect du Code de la route sénégalais, et à le restituer dans l\'état initial à la date et heure convenues.',
                    'Tout retard de restitution sera facturé au prix journalier majoré de 50 %. Le locataire ne peut en aucun cas sous-louer le véhicule à un tiers.',
                    'Le locataire est responsable de toute infraction au code de la route commise pendant la location et doit signaler immédiatement tout accident ou dommage au propriétaire et à AutoLoc.',
                ],
            },
            {
                label: 'Article 8 — État des lieux',
                items: [
                    'Un état des lieux contradictoire est établi entre le propriétaire et le locataire au début et à la fin de la période de location, accompagné de photos et vidéos. Cet état des lieux fait foi en cas de litige sur l\'état du véhicule.',
                ],
            },
            {
                label: 'Article 9 — Accidents et dommages',
                items: [
                    'En cas d\'accident, de vol ou de dommages survenus pendant la location, le locataire informe immédiatement le propriétaire et AutoLoc, et remplit un constat amiable.',
                    'Le locataire est tenu responsable des dommages causés au véhicule, sous réserve des franchises d\'assurance applicables. Tout litige est soumis à la médiation d\'AutoLoc avant toute action judiciaire. Le présent contrat est régi par le droit sénégalais.',
                ],
            },
        ];

        articles.forEach((article) => {
            if (doc.y > 680) doc.addPage();

            // Article label
            doc.fontSize(8).fillColor(C.ink).font('Helvetica-Bold')
                .text(article.label, M + 8, doc.y, { width: CW - 16 });
            doc.y += 4;

            // Bullet items
            article.items.forEach((item) => {
                const bulletX = M + 16;
                const textX = M + 26;
                const itemY = doc.y;
                doc.fontSize(7).fillColor(C.muted).font('Helvetica')
                    .text('–', bulletX, itemY, { width: 8 });
                doc.fontSize(7.5).fillColor(C.body).font('Helvetica')
                    .text(item, textX, itemY, { width: CW - 36, lineGap: 1.5 });
                doc.y += 4;
            });

            doc.y += 8;
        });

        // CGU reference line
        doc.fontSize(7).fillColor(C.muted).font('Helvetica')
            .text('Le texte intégral des conditions générales est disponible sur : autoloc.sn/cgu', M + 8, doc.y, { width: CW - 16 });
        doc.y += 16;
    }

    // ── Signatures ─────────────────────────────────────────────────────────────

    private renderSignatures(doc: PDFKit.PDFDocument, data: ContractData): void {
        if (doc.y > 590) doc.addPage();
        this.sectionTitle(doc, 'SIGNATURES');

        const colW = (CW - 16) / 2;
        const startY = doc.y;
        const boxH = 118;
        const sigZoneH = 42;   // height of the dotted signature zone
        const sigZoneTop = 50; // y offset inside the card

        const parties = [
            { label: 'LE LOCATAIRE', name: `${data.locataire.prenom} ${data.locataire.nom}`, x: M },
            { label: 'LE PROPRIÉTAIRE', name: `${data.proprietaire.prenom} ${data.proprietaire.nom}`, x: M + colW + 16 },
        ];

        parties.forEach(({ label, name, x }) => {
            // Card background + border
            doc.roundedRect(x, startY, colW, boxH, 6)
                .fillColor('#FFFFFF').fill();
            doc.roundedRect(x, startY, colW, boxH, 6)
                .strokeColor(C.border).lineWidth(0.75).stroke();

            // Header row — emerald left accent
            doc.rect(x, startY, 3.5, 38).fillColor(C.accentLine).fill();

            // Party label + name
            doc.fontSize(7).fillColor(C.muted).font('Helvetica-Bold')
                .text(label, x + 14, startY + 8, { width: colW - 24, characterSpacing: 0.9 });
            doc.fontSize(10).fillColor(C.ink).font('Helvetica-Bold')
                .text(name, x + 14, startY + 20, { width: colW - 24 });

            // "Lu et approuvé" mention
            doc.fontSize(7.5).fillColor(C.muted).font('Helvetica')
                .text('Lu et approuvé — Bon pour accord', x + 14, startY + 38, { width: colW - 28 });

            // ── Signature zone (dotted rect) ──
            const szX = x + 12;
            const szY = startY + sigZoneTop;
            const szW = colW * 0.56;
            doc.rect(szX, szY, szW, sigZoneH)
                .fillColor(C.surface).fill();
            doc.rect(szX, szY, szW, sigZoneH)
                .strokeColor(C.border).lineWidth(0.5)
                .dash(3, { space: 3 }).stroke();
            doc.undash();
            doc.fontSize(7).fillColor(C.muted).font('Helvetica')
                .text('Signature', szX + 4, szY + sigZoneH - 11, { width: 50 });

            // ── Date zone ──
            const dzX = x + colW * 0.64;
            const dzW = colW - colW * 0.64 - 12;
            doc.rect(dzX, szY, dzW, sigZoneH)
                .fillColor(C.surface).fill();
            doc.rect(dzX, szY, dzW, sigZoneH)
                .strokeColor(C.border).lineWidth(0.5)
                .dash(3, { space: 3 }).stroke();
            doc.undash();
            doc.fontSize(7).fillColor(C.muted).font('Helvetica')
                .text('Date', dzX + 4, szY + sigZoneH - 11, { width: dzW - 8 });
        });

        doc.y = startY + boxH + 20;
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
