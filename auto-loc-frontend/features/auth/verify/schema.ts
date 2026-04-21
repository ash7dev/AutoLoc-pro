import { z } from 'zod';

export const otpSchema = z.object({
  code: z
    .string()
    .refine((val) => val.length === 6 || val.length === 8, {
      message: 'Le code doit contenir 6 ou 8 chiffres',
    }),
});

export type OtpInput = z.infer<typeof otpSchema>;
