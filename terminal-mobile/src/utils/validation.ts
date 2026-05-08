import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.'),
  password: z
    .string()
    .min(1, 'Password is required.'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

const registerBaseSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.'),
  phone: z
    .string()
    .min(1, 'Phone number is required.')
    .regex(
      /^0[789]\d{9}$/,
      'Enter a valid Nigerian phone number (e.g. 08012345678).'
    ),
  first_name: z
    .string()
    .min(1, 'First name is required.')
    .max(50, 'First name must be under 50 characters.'),
  last_name: z
    .string()
    .min(1, 'Last name is required.')
    .max(50, 'Last name must be under 50 characters.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.'),
  password_confirm: z
    .string()
    .min(1, 'Confirm your password.'),
});

export type RegisterFormData = z.infer<typeof registerBaseSchema>;

export const registerSchema = registerBaseSchema.refine(
  (data) => data.password === data.password_confirm,
  { message: 'Passwords do not match.', path: ['password_confirm'] },
);

export const verifyPhoneSchema = z.object({
  otp_code: z
    .string()
    .length(6, 'Enter the 6-digit code.')
    .regex(/^\d{6}$/, 'Code must be 6 digits.'),
});

export type VerifyPhoneFormData = z.infer<typeof verifyPhoneSchema>;
