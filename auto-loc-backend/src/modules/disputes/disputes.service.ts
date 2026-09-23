import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatutReservation, StatutLitige, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestUser } from '../../common/types/auth.types';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { GetDisputesQueueDto } from './dto/get-disputes.dto';
import { NotificationService } from '../../infrastructure/notifications/notification.service';
import { TelegramService } from '../../infrastructure/telegram/telegram.service';

const DISPUTE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h

@Injectable()
export class DisputesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
    private readonly telegram: TelegramService,
  ) { }

  // ── POST /reservations/:id/dispute ────────────────────────────────────────────

  async create(user: RequestUser, reservationId: string, dto: CreateDisputeDto) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!utilisateur) throw new ForbiddenException('Profil incomplet');

    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      select: {
        id: true,
        locataireId: true,
        proprietaireId: true,
        statut: true,
        dateFin: true,
        checkoutLe: true,
        litige: { select: { id: true } },
        locataire: { select: { email: true } },
        proprietaire: { select: { email: true } },
      },
    });
    if (!reservation) throw new NotFoundException('Réservation introuvable');

    // ── Determine role ──────────────────────────────────────────────────
    const isOwner = reservation.proprietaireId === utilisateur.id;
    const isTenant = reservation.locataireId === utilisateur.id;
    if (!isOwner && !isTenant) throw new ForbiddenException('Accès refusé');

    // ── Already has a dispute? ──────────────────────────────────────────
    if (reservation.litige) {
      throw new ConflictException('Un litige existe déjà pour cette réservation');
    }

    // ── Validate per-role dispute windows ────────────────────────────────
    if (isTenant) {
      // Locataire : peut déclarer uniquement si CONFIRMEE (non-conformité véhicule au check-in)
      if (reservation.statut !== StatutReservation.CONFIRMEE) {
        throw new BadRequestException(
          'En tant que locataire, un litige for non-conformité ne peut être déclaré que pendant le check-in (statut CONFIRMEE)',
        );
      }
    } else if (isOwner) {
      // Propriétaire : peut déclarer si EN_COURS ou TERMINEE dans les 24h
      const allowedStatuts: StatutReservation[] = [
        StatutReservation.EN_COURS,
        StatutReservation.TERMINEE,
      ];
      if (!allowedStatuts.includes(reservation.statut)) {
        throw new BadRequestException(
          'En tant que propriétaire, un litige ne peut être déclaré que pour une réservation EN_COURS ou TERMINEE',
        );
      }

      // Fenêtre 24h pour les réservations TERMINEE
      if (reservation.statut === StatutReservation.TERMINEE) {
        const referenceDate = reservation.checkoutLe ?? reservation.dateFin;
        const deadline = new Date(new Date(referenceDate).getTime() + DISPUTE_WINDOW_MS);
        if (new Date() > deadline) {
          throw new BadRequestException(
            'Le délai de 24h pour déclarer un litige après la fin de la location est dépassé',
          );
        }
      }
    }

    // ── Create dispute in transaction ───────────────────────────────────
    const litige = await this.prisma.$transaction(async (tx) => {
      const created = await tx.litige.create({
        data: {
          reservationId,
          motif: dto.motif,
          description: dto.description,
          coutEstime: dto.coutEstime ?? null,
        },
        select: { id: true, statut: true, creeLe: true },
      });

      // Mettre le statut en LITIGE si la réservation est EN_COURS
      if (reservation.statut === StatutReservation.EN_COURS) {
        await tx.reservation.update({
          where: { id: reservationId },
          data: { statut: StatutReservation.LITIGE },
        });
        await tx.reservationHistorique.create({
          data: {
            reservationId,
            ancienStatut: StatutReservation.EN_COURS,
            nouveauStatut: StatutReservation.LITIGE,
            modifiePar: utilisateur.id,
          },
        });
      }

      // Si litige locataire pendant CONFIRMEE → annuler la réservation
      if (isTenant && reservation.statut === StatutReservation.CONFIRMEE) {
        await tx.reservation.update({
          where: { id: reservationId },
          data: {
            statut: StatutReservation.ANNULEE,
            annuleParId: utilisateur.id,
            annuleLe: new Date(),
            raisonAnnulation: `Litige locataire : ${dto.description}`,
          },
        });
        await tx.reservationHistorique.create({
          data: {
            reservationId,
            ancienStatut: StatutReservation.CONFIRMEE,
            nouveauStatut: StatutReservation.ANNULEE,
            modifiePar: utilisateur.id,
          },
        });
      }

      return created;
    });

    const locataireData = { reservationId, isOwner: false };
    const proprietaireData = { reservationId, isOwner: true };

    if (reservation.locataire?.email) {
      this.notification.send({
        email: reservation.locataire.email,
        type: 'litige.ouvert',
        data: locataireData,
      }).catch(() => { });
    }
    if (reservation.proprietaire?.email) {
      this.notification.send({
        email: reservation.proprietaire.email,
        type: 'litige.ouvert',
        data: proprietaireData,
      }).catch(() => { });
    }

    // Alerte admin Telegram — urgente, fire-and-forget
    const role = isOwner ? 'Propriétaire' : 'Locataire';
    const montant = dto.coutEstime ? `\nMontant estimé : ${Number(dto.coutEstime).toLocaleString('fr-FR')} FCFA` : '';
    this.telegram.sendAdminAlert(
      `🚨 <b>Litige ouvert</b>\n` +
      `Déclaré par : ${role}\n` +
      `Motif : ${dto.description.slice(0, 100)}${dto.description.length > 100 ? '…' : ''}${montant}\n` +
      `<a href="https://autoloc.sn/admin/disputes">Traiter en urgence →</a>`,
    ).catch(() => { });

    return {
      disputeId: litige.id,
      statut: litige.statut,
      creeLe: litige.creeLe,
      declaredBy: isOwner ? 'PROPRIETAIRE' : 'LOCATAIRE',
    };
  }

  // ── GET /admin/disputes ───────────────────────────────────────────────────────

  async adminList(dto: GetDisputesQueueDto = {}) {
    const { statut, search, page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    const searchCondition: Prisma.LitigeWhereInput | undefined = search?.trim()
      ? {
          OR: [
            { motif: { contains: search.trim(), mode: 'insensitive' } },
            { description: { contains: search.trim(), mode: 'insensitive' } },
            { reservation: { locataire: { prenom: { contains: search.trim(), mode: 'insensitive' } } } },
            { reservation: { locataire: { nom: { contains: search.trim(), mode: 'insensitive' } } } },
            { reservation: { locataire: { email: { contains: search.trim(), mode: 'insensitive' } } } },
            { reservation: { locataire: { telephone: { contains: search.trim(), mode: 'insensitive' } } } },
            { reservation: { proprietaire: { prenom: { contains: search.trim(), mode: 'insensitive' } } } },
            { reservation: { proprietaire: { nom: { contains: search.trim(), mode: 'insensitive' } } } },
            { reservation: { proprietaire: { email: { contains: search.trim(), mode: 'insensitive' } } } },
            { reservation: { proprietaire: { telephone: { contains: search.trim(), mode: 'insensitive' } } } },
            { reservation: { vehicule: { marque: { contains: search.trim(), mode: 'insensitive' } } } },
            { reservation: { vehicule: { modele: { contains: search.trim(), mode: 'insensitive' } } } },
            { reservation: { vehicule: { immatriculation: { contains: search.trim(), mode: 'insensitive' } } } },
          ],
        }
      : undefined;

    let statusCondition: Prisma.LitigeWhereInput = {};
    if (statut && statut !== 'ALL') {
      statusCondition = { statut: statut as StatutLitige };
    }

    const where: Prisma.LitigeWhereInput = {
      ...statusCondition,
      ...(searchCondition ? searchCondition : {}),
    };

    const now = new Date();

    const [items, total, pendingCount, fondeCount, nonFondeCount, totalCount] = await Promise.all([
      this.prisma.litige.findMany({
        where,
        orderBy: statut === 'EN_ATTENTE' ? { creeLe: 'asc' } : { creeLe: 'desc' },
        take: limit,
        skip,
        include: {
          reservation: {
            select: {
              id: true,
              statut: true,
              totalLocataire: true,
              netProprietaire: true,
              dateDebut: true,
              dateFin: true,
              locataire: {
                select: {
                  id: true,
                  prenom: true,
                  nom: true,
                  email: true,
                  telephone: true,
                  avatarUrl: true,
                  statutKyc: true,
                },
              },
              proprietaire: {
                select: {
                  id: true,
                  prenom: true,
                  nom: true,
                  email: true,
                  telephone: true,
                  avatarUrl: true,
                  statutKyc: true,
                },
              },
              vehicule: {
                select: {
                  id: true,
                  marque: true,
                  modele: true,
                  immatriculation: true,
                  ville: true,
                  photos: {
                    select: { url: true, estPrincipale: true },
                    orderBy: { position: 'asc' },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.litige.count({ where }),
      this.prisma.litige.count({ where: { statut: StatutLitige.EN_ATTENTE } }),
      this.prisma.litige.count({ where: { statut: StatutLitige.FONDE } }),
      this.prisma.litige.count({ where: { statut: StatutLitige.NON_FONDE } }),
      this.prisma.litige.count(),
    ]);

    const formattedItems = items.map((l) => {
      const createdDate = new Date(l.creeLe);
      const slaWaitHours = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60));
      const res = l.reservation;
      const vehiclePhoto = res.vehicule?.photos?.[0]?.url ?? null;

      return {
        id: l.id,
        reservationId: res.id,
        motif: l.motif,
        description: l.description,
        coutEstime: l.coutEstime ? Number(l.coutEstime) : null,
        montantCompensation: l.montantCompensation ? Number(l.montantCompensation) : null,
        statut: l.statut,
        openedAt: l.creeLe.toISOString(),
        resoluLe: l.resoluLe ? l.resoluLe.toISOString() : null,
        resoluParAdminId: l.resoluParAdminId,
        slaWaitHours,
        renter: {
          id: res.locataire?.id ?? null,
          fullName: [res.locataire?.prenom, res.locataire?.nom].filter(Boolean).join(' ') || 'Locataire Inconnu',
          email: res.locataire?.email ?? null,
          phone: res.locataire?.telephone ?? null,
          avatarUrl: res.locataire?.avatarUrl ?? null,
          statutKyc: res.locataire?.statutKyc ?? 'NON_VERIFIE',
        },
        owner: {
          id: res.proprietaire?.id ?? null,
          fullName: [res.proprietaire?.prenom, res.proprietaire?.nom].filter(Boolean).join(' ') || 'Propriétaire Inconnu',
          email: res.proprietaire?.email ?? null,
          phone: res.proprietaire?.telephone ?? null,
          avatarUrl: res.proprietaire?.avatarUrl ?? null,
          statutKyc: res.proprietaire?.statutKyc ?? 'NON_VERIFIE',
        },
        vehicle: {
          id: res.vehicule?.id ?? null,
          name: res.vehicule ? `${res.vehicule.marque} ${res.vehicule.modele}` : 'Véhicule',
          immatriculation: res.vehicule?.immatriculation ?? null,
          ville: res.vehicule?.ville ?? null,
          photoUrl: vehiclePhoto,
        },
        booking: {
          totalLocataire: Number(res.totalLocataire),
          netProprietaire: Number(res.netProprietaire),
          statut: res.statut,
          dateDebut: res.dateDebut.toISOString(),
          dateFin: res.dateFin.toISOString(),
        },
      };
    });

    return {
      data: formattedItems,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      counts: {
        pending: pendingCount,
        fonde: fondeCount,
        nonFonde: nonFondeCount,
        total: totalCount,
      },
    };
  }

  // ── GET /admin/disputes/:id ───────────────────────────────────────────────────

  async adminDetail(id: string) {
    const litige = await this.prisma.litige.findUnique({
      where: { id },
      include: {
        reservation: {
          include: {
            locataire: {
              select: {
                id: true,
                prenom: true,
                nom: true,
                email: true,
                telephone: true,
                avatarUrl: true,
                statutKyc: true,
              },
            },
            proprietaire: {
              select: {
                id: true,
                prenom: true,
                nom: true,
                email: true,
                telephone: true,
                avatarUrl: true,
                statutKyc: true,
              },
            },
            vehicule: {
              select: {
                id: true,
                marque: true,
                modele: true,
                immatriculation: true,
                annee: true,
                type: true,
                carburant: true,
                transmission: true,
                nombrePlaces: true,
                ville: true,
                photos: {
                  select: { id: true, url: true, estPrincipale: true },
                  orderBy: { position: 'asc' },
                },
              },
            },
            photosEtatLieu: {
              select: { id: true, url: true, type: true, creeLe: true, categorie: true },
              orderBy: { position: 'asc' },
            },
            paiement: {
              select: {
                id: true,
                montant: true,
                statut: true,
                fournisseur: true,
                idTransactionFournisseur: true,
                creeLe: true,
              },
            },
          },
        },
      },
    });

    if (!litige) throw new NotFoundException('Litige introuvable');

    const res = litige.reservation;
    const now = new Date();
    const createdDate = new Date(litige.creeLe);
    const slaWaitHours = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60));

    const photosCheckin = res.photosEtatLieu.filter((p) => p.type === 'CHECKIN');
    const photosCheckout = res.photosEtatLieu.filter((p) => p.type === 'CHECKOUT');

    return {
      id: litige.id,
      motif: litige.motif,
      description: litige.description,
      coutEstime: litige.coutEstime ? Number(litige.coutEstime) : null,
      montantCompensation: litige.montantCompensation ? Number(litige.montantCompensation) : null,
      statut: litige.statut,
      openedAt: litige.creeLe.toISOString(),
      resoluLe: litige.resoluLe ? litige.resoluLe.toISOString() : null,
      resoluParAdminId: litige.resoluParAdminId,
      slaWaitHours,
      reservation: {
        id: res.id,
        statut: res.statut,
        totalLocataire: Number(res.totalLocataire),
        netProprietaire: Number(res.netProprietaire),
        montantPayeEnLigne: Number(res.montantPayeEnLigne),
        montantSoldeCheckin: Number(res.montantSoldeCheckin),
        dateDebut: res.dateDebut.toISOString(),
        dateFin: res.dateFin.toISOString(),
        contratUrl: res.contratUrl ?? null,
        locataire: {
          id: res.locataire?.id ?? null,
          fullName: [res.locataire?.prenom, res.locataire?.nom].filter(Boolean).join(' ') || 'Locataire Inconnu',
          email: res.locataire?.email ?? null,
          phone: res.locataire?.telephone ?? null,
          avatarUrl: res.locataire?.avatarUrl ?? null,
          statutKyc: res.locataire?.statutKyc ?? 'NON_VERIFIE',
        },
        proprietaire: {
          id: res.proprietaire?.id ?? null,
          fullName: [res.proprietaire?.prenom, res.proprietaire?.nom].filter(Boolean).join(' ') || 'Propriétaire Inconnu',
          email: res.proprietaire?.email ?? null,
          phone: res.proprietaire?.telephone ?? null,
          avatarUrl: res.proprietaire?.avatarUrl ?? null,
          statutKyc: res.proprietaire?.statutKyc ?? 'NON_VERIFIE',
        },
        vehicule: res.vehicule,
        photosCheckin,
        photosCheckout,
        paiement: res.paiement
          ? {
              id: res.paiement.id,
              montant: Number(res.paiement.montant),
              statut: res.paiement.statut,
              fournisseur: res.paiement.fournisseur,
              transactionId: res.paiement.idTransactionFournisseur ?? null,
            }
          : null,
      },
    };
  }
}
