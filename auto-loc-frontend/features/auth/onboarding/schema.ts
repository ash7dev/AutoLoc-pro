import { z } from 'zod';

export const onboardingSchema = z.object({
  prenom: z.string().min(2, { message: 'Prénom requis' }),
  nom: z.string().min(2, { message: 'Nom requis' }),
  telephone: z.string().min(8, { message: 'Téléphone requis' }),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
