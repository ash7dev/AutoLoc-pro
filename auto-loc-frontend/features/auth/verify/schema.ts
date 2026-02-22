import { z } from 'zod';

export const otpSchema = z.object({
  code: z
    .string()
    .min(6, { message: 'Code invalide' })
    .max(6, { message: 'Code invalide' }),
});

export type OtpInput = z.infer<typeof otpSchema>;
