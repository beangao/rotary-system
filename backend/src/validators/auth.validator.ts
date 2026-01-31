import { z } from 'zod';

export const sendCodeSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'メールアドレスを入力してください' })
      .email('正しいメールアドレスを入力してください'),
  }),
});

export const verifyCodeSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'メールアドレスを入力してください' })
      .email('正しいメールアドレスを入力してください'),
    code: z
      .string({ required_error: '認証コードを入力してください' })
      .length(6, '認証コードは6桁です'),
  }),
});

export const setPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'メールアドレスを入力してください' })
      .email('正しいメールアドレスを入力してください'),
    code: z
      .string({ required_error: '認証コードを入力してください' })
      .length(6, '認証コードは6桁です'),
    password: z
      .string({ required_error: 'パスワードを入力してください' })
      .min(8, 'パスワードは8文字以上で入力してください')
      .regex(/[A-Z]/, 'パスワードには大文字を含めてください')
      .regex(/[a-z]/, 'パスワードには小文字を含めてください')
      .regex(/[0-9]/, 'パスワードには数字を含めてください'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'メールアドレスを入力してください' })
      .email('正しいメールアドレスを入力してください'),
    password: z.string({ required_error: 'パスワードを入力してください' }),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'メールアドレスを入力してください' })
      .email('正しいメールアドレスを入力してください'),
    code: z
      .string({ required_error: '認証コードを入力してください' })
      .length(6, '認証コードは6桁です'),
    newPassword: z
      .string({ required_error: '新しいパスワードを入力してください' })
      .min(8, 'パスワードは8文字以上で入力してください')
      .regex(/[A-Z]/, 'パスワードには大文字を含めてください')
      .regex(/[a-z]/, 'パスワードには小文字を含めてください')
      .regex(/[0-9]/, 'パスワードには数字を含めてください'),
  }),
});

export type SendCodeInput = z.infer<typeof sendCodeSchema>['body'];
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>['body'];
export type SetPasswordInput = z.infer<typeof setPasswordSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
