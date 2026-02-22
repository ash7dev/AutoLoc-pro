import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Email invalide' }),
  password: z.string().min(6, { message: 'Mot de passe trop court' }),
});

export const loginPhoneSchema = z.object({
  phone: z.string().min(8, { message: 'Téléphone requis' }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type LoginPhoneInput = z.infer<typeof loginPhoneSchema>;
