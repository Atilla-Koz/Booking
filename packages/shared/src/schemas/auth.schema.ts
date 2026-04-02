import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1, 'Name is required'),
  password: z.string().min(1, 'Password is required'),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
