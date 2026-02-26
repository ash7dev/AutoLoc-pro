// ── Payment Provider Interface ─────────────────────────────────────────────────
// All payment providers (Wave, Orange Money) implement this interface.
// This ensures plug-and-play swapping via PaymentProviderFactory.

export interface InitiatePaymentParams {
    /** Montant en FCFA (XOF) — entier, pas de décimales */
    amount: number;
    /** Notre référence interne (reservationId ou paymentRef) */
    referenceId: string;
    /** URL webhook où le fournisseur enverra la confirmation */
    callbackUrl: string;
    /** Description affichée à l'utilisateur côté fournisseur */
    description?: string;
    /** Numéro de téléphone du payeur (requis pour certains providers) */
    payerPhone?: string;
}

export interface InitiatePaymentResult {
    /** URL vers laquelle rediriger l'utilisateur pour payer */
    paymentUrl: string;
    /** ID de transaction côté fournisseur */
    transactionId: string;
}

export interface WebhookPayload {
    /** ID transaction côté fournisseur */
    transactionId: string;
    /** Statut normalisé */
    status: 'SUCCESS' | 'FAILED' | 'REFUNDED';
    /** Montant confirmé en XOF */
    amount: number;
    /** Notre référence (reservationId ou paymentRef) */
    referenceId: string;
    /** Payload brut du fournisseur (pour logging/debug) */
    rawPayload: Record<string, unknown>;
}

export interface PaymentProviderInterface {
    /** Identifiant du fournisseur */
    readonly provider: 'WAVE' | 'ORANGE_MONEY';

    /**
     * Initie un paiement et retourne l'URL de redirection.
     */
    initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult>;

    /**
     * Vérifie la signature HMAC du webhook.
     * @param rawBody Body brut (Buffer) — AVANT le parsing JSON
     * @param signature Valeur du header de signature (X-Wave-Signature, etc.)
     * @returns true si la signature est valide
     */
    verifyWebhookSignature(rawBody: Buffer, signature: string): boolean;

    /**
     * Parse le payload webhook brut et extrait les champs normalisés.
     */
    parseWebhookPayload(rawBody: Buffer): WebhookPayload;

    /**
     * Initie un remboursement.
     */
    refundPayment(transactionId: string, amount?: number): Promise<void>;
}
