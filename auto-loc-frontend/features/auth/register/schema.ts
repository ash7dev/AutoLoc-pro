import { z } from 'zod';

const optionalTrimmed = (schema: z.ZodString) =>
  z.preprocess((val) => {
    if (typeof val !== 'string') return val;
    const trimmed = val.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }, schema.optional());

export const registerSchema = z.object({
  email: z.string().email({ message: 'Email invalide' }),
  password: z.string().min(6, { message: 'Mot de passe trop court' }),
  prenom: optionalTrimmed(z.string().min(2, { message: 'Prénom trop court' })),
  nom: optionalTrimmed(z.string().min(2, { message: 'Nom trop court' })),
  telephone: optionalTrimmed(z.string().min(8, { message: 'Téléphone invalide' })),
});

export type RegisterInput = z.infer<typeof registerSchema>;
