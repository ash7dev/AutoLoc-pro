// ── Payment Provider Interface ─────────────────────────────────────────────────
// All payment providers (Wave, Orange Money, InTouch) implement this interface.
// This ensures plug-and-play swapping via PaymentProviderFactory.

export interface InitiatePaymentParams {
    /** Montant en FCFA (XOF) — entier, pas de décimales */
    amount: number;
    /** Notre référence interne (paymentRef) — sert d'idFromClient côté InTouch */
    referenceId: string;
    /** URL webhook IPN où le fournisseur enverra la confirmation (backend) */
    callbackUrl: string;
    /** Description affichée à l'utilisateur côté fournisseur */
    description?: string;
    /** Numéro de téléphone du payeur (requis pour certains providers) */
    payerPhone?: string;
    /** Email du payeur (requis pour InTouch API directe) */
    payerEmail?: string;
    /** Prénom du payeur (requis pour InTouch API directe) */
    payerFirstName?: string;
    /** Nom de famille du payeur (requis pour InTouch API directe) */
    payerLastName?: string;
    /** Méthode de paiement cible — ex: 'Wave', 'Orange Money', 'Free Money' */
    targetPayment?: string;
    /** URL de redirection après paiement réussi (frontend) */
    successUrl?: string;
    /** URL de redirection après annulation (frontend) */
    cancelUrl?: string;
}

/** Configuration transmise au frontend pour déclencher le widget TouchPay. */
export interface IntouchWidgetConfig {
    /** URL du script SDK TouchPay à charger dynamiquement */
    scriptUrl: string;
    /** Identifiant marchand InTouch */
    merchantId: string;
    /** Token marchand InTouch */
    token: string;
    /** Domaine du site marchand */
    domain: string;
    /** URL de redirection après paiement réussi */
    successUrl: string;
    /** URL de redirection après annulation */
    cancelUrl: string;
    /** Montant en FCFA (XOF) */
    amount: number;
    /** Ville du marchand */
    city: string;
    /** Référence client — sert de clé de lookup pour le webhook */
    idFromClient: string;
}

export interface InitiatePaymentResult {
    /** URL de redirection (providers redirect-based : Wave, Orange Money direct) */
    paymentUrl?: string;
    /** Config widget TouchPay (InTouch) — si présent, le frontend utilise le SDK */
    widgetConfig?: IntouchWidgetConfig;
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
    /** Notre référence (paymentRef) */
    referenceId: string;
    /** Payload brut du fournisseur (pour logging/debug) */
    rawPayload: Record<string, unknown>;
}

export interface PaymentProviderInterface {
    /** Identifiant du fournisseur */
    readonly provider: 'WAVE' | 'ORANGE_MONEY' | 'INTOUCH';

    /**
     * Initie un paiement.
     * - Providers redirect : retourne `paymentUrl` (URL de redirection)
     * - InTouch widget    : retourne `widgetConfig` (params pour le SDK frontend)
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
     * @param queryParams Query params de la requête (InTouch envoie les données ici)
     */
    parseWebhookPayload(rawBody: Buffer, queryParams?: Record<string, string>): WebhookPayload;

    /**
     * Initie un remboursement.
     */
    refundPayment(transactionId: string, amount?: number): Promise<void>;
}
