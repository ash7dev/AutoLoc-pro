import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({ message: 'Adresse email invalide' }),

  password: z.string()
    .min(8, { message: 'Au moins 8 caractères requis' })
    .regex(/[A-Z]/, { message: 'Au moins une majuscule requise' })
    .regex(/[a-z]/, { message: 'Au moins une minuscule requise' })
    .regex(/[0-9]/, { message: 'Au moins un chiffre requis' }),

  prenom: z.string().trim()
    .min(2, { message: 'Au moins 2 caractères' })
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, { message: 'Ne doit contenir que des lettres' }),

  nom: z.string().trim()
    .min(2, { message: 'Au moins 2 caractères' })
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, { message: 'Ne doit contenir que des lettres' }),

  telephone: z.string().trim()
    .transform(val => val.replace(/\s+/g, ''))
    .refine(val => {
      // Format Sénégalais local (9 chiffres)
      if (/^(70|71|75|76|77|78|33)\d{7}$/.test(val)) return true;
      // Format international E.164 (ex: +33612345678)
      return /^\+\d{8,15}$/.test(val);
    }, {
      message: 'Format de téléphone invalide',
    }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
