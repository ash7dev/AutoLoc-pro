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
        proprietaire: { telephone: string | null; prenom: string | null };
    }): Promise<{ walletCredited: boolean }> {
        const { reservationId, dateFin, locataire, proprietaire } = params;

        let walletCredited = false;
        try {
            const walletResult = await this.creditWallet.execute(reservationId);
            walletCredited = !walletResult.alreadyCredited;
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            process.stderr.write(`[CheckIn] Wallet credit failed for ${reservationId}: ${errMsg}\n`);
        }

        await this.queue
            .scheduleAutoClose(reservationId, dateFin)
            .catch(() => { });

        await this.queue
            .scheduleNotification({
                type: 'reservation.checkin',
                data: {
                    reservationId,
                    locatairePhone: locataire.telephone ?? null,
                    locatairePrenom: locataire.prenom ?? null,
                    proprietairePhone: proprietaire.telephone ?? null,
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
                        proprietairePhone: proprietaire.telephone ?? null,
                        proprietairePrenom: proprietaire.prenom ?? null,
                    },
                })
                .catch(() => { });
        }

        return { walletCredited };
    }
}
