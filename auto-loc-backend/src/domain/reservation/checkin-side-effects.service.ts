import { Injectable } from '@nestjs/common';
import { QueueService } from '../../infrastructure/queue/queue.service';
import { CreditWalletUseCase } from '../wallet/use-cases/credit-wallet.use-case';

/**
 * Effets après check-in finalisé (EN_COURS) : crédit wallet, auto-close fin de location, notifications.
 * Partagé entre check-in manuel et validation tacite.
 */
@Injectable()
export class CheckinSideEffectsService {
    constructor(
        private readonly queue: QueueService,
        private readonly creditWallet: CreditWalletUseCase,
    ) { }

    async runAfterFinalizedCheckin(params: {
        reservationId: string;
        dateFin: Date;
        locataire: { telephone: string | null; prenom: string | null };
        locataireId: string;
        proprietaire: { telephone: string | null; prenom: string | null };
        proprietaireId: string;
    }): Promise<{ walletCredited: boolean }> {
        const { reservationId, dateFin, locataire, locataireId, proprietaire, proprietaireId } = params;

        let walletCredited = false;
        let montantCredite = '0';
        try {
            const walletResult = await this.creditWallet.execute(reservationId);
            walletCredited = !walletResult.alreadyCredited;
            montantCredite = walletResult.montantCredite.toString();
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            process.stderr.write(`[CheckIn] Wallet credit failed for ${reservationId}: ${errMsg}\n`);
        }

        await this.queue
            .scheduleAutoClose(reservationId, dateFin)
            .catch(() => { });

        // Notification de check-in finalisé au locataire
        await this.queue
            .scheduleNotification({
                type: 'reservation.checkin',
                data: {
                    reservationId,
                    userId: locataireId,
                    phone: locataire.telephone ?? null,
                    locatairePrenom: locataire.prenom ?? null,
                },
            })
            .catch(() => { });

        // Notification de check-in finalisé au propriétaire
        await this.queue
            .scheduleNotification({
                type: 'reservation.checkin',
                data: {
                    reservationId,
                    userId: proprietaireId,
                    phone: proprietaire.telephone ?? null,
                    proprietairePrenom: proprietaire.prenom ?? null,
                },
            })
            .catch(() => { });

        if (walletCredited) {
            await this.queue
                .scheduleNotification({
                    type: 'wallet.credited',
                    data: {
                        reservationId,
                        userId: proprietaireId,
                        phone: proprietaire.telephone ?? null,
                        proprietairePrenom: proprietaire.prenom ?? null,
                        montant: montantCredite,
                    },
                })
                .catch(() => { });
        }

        return { walletCredited };
    }
}
