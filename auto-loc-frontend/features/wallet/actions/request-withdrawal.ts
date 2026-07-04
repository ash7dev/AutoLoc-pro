'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { CACHE_TAGS, getOwnerScopedTag } from '@/lib/cache-config';

interface RequestWithdrawalInput {
  montant: number;
  methode: 'WAVE' | 'ORANGE_MONEY';
  numeroDestinataire: string;
}

/**
 * Server Action pour demander un retrait
 */
export async function requestWithdrawalAction(input: RequestWithdrawalInput): Promise<void> {
  const token = cookies().get('nest_access')?.value;

  if (!token) {
    throw new Error('Non authentifié');
  }

  // Appeler l'API backend
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.autoloc.sn';
  const response = await fetch(`${apiUrl}/wallet/withdraw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur lors du retrait' }));
    throw new Error(error.message || 'Erreur lors du retrait');
  }

  // Invalider les caches du wallet
  revalidateTag(getOwnerScopedTag(CACHE_TAGS.owner_wallet, token));
  revalidateTag(getOwnerScopedTag(CACHE_TAGS.owner_transactions, token));
}
