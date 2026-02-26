import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({ message: 'Email invalide' }),
  password: z.string().min(6, { message: 'Mot de passe trop court' }),
  prenom: z.string().min(2, { message: 'Prénom trop court' }).optional(),
  nom: z.string().min(2, { message: 'Nom trop court' }).optional(),
  telephone: z.string().min(8, { message: 'Téléphone invalide' }).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
