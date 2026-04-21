import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({ message: 'Email invalide' }),
  password: z.string().min(6, { message: 'Mot de passe trop court' }),
  prenom: z.string().trim().min(2, { message: 'Prénom trop court' }),
  nom: z.string().trim().min(2, { message: 'Nom trop court' }),
  telephone: z.string().trim().min(8, { message: 'Téléphone invalide' }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
