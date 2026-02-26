import { Injectable } from '@nestjs/common';
import { FournisseurPaiement } from '@prisma/client';
import { PaymentProviderInterface } from './payment-provider.interface';
import { WaveProvider } from './providers/wave.provider';
import { OrangeMoneyProvider } from './providers/orange-money.provider';

@Injectable()
export class PaymentProviderFactory {
    private readonly providers: Map<string, PaymentProviderInterface>;

    constructor(
        private readonly wave: WaveProvider,
        private readonly orange: OrangeMoneyProvider,
    ) {
        this.providers = new Map<string, PaymentProviderInterface>([
            ['WAVE', this.wave],
            ['ORANGE_MONEY', this.orange],
        ]);
    }

    /**
     * Retourne le provider correspondant au fournisseur.
     * @throws Error si le fournisseur n'est pas supporté.
     */
    get(fournisseur: FournisseurPaiement): PaymentProviderInterface {
        const provider = this.providers.get(fournisseur);
        if (!provider) {
            throw new Error(
                `Payment provider not supported: ${fournisseur}. Available: ${[...this.providers.keys()].join(', ')}`,
            );
        }
        return provider;
    }

    /**
     * Retourne le provider correspondant à un nom de route webhook.
     * Ex: getByRoute('wave') → WaveProvider
     */
    getByRoute(routeName: string): PaymentProviderInterface | undefined {
        const mapping: Record<string, string> = {
            wave: 'WAVE',
            'orange-money': 'ORANGE_MONEY',
        };
        const fournisseur = mapping[routeName];
        return fournisseur ? this.providers.get(fournisseur) : undefined;
    }
}
