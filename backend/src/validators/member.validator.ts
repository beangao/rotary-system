import { z } from 'zod';

export const createMemberSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'メールアドレスを入力してください' })
      .email('正しいメールアドレスを入力してください'),
    lastName: z.string({ required_error: '姓を入力してください' }).min(1, '姓を入力してください'),
    firstName: z.string({ required_error: '名を入力してください' }).min(1, '名を入力してください'),
    lastNameKana: z.string().optional(),
    firstNameKana: z.string().optional(),
    memberNumber: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    birthDate: z.string().optional(),
    position: z.string().optional(),
    joinDate: z.string().optional(),
  }),
});

export const updateMemberSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    email: z.string().email('正しいメールアドレスを入力してください').optional(),
    lastName: z.string().min(1, '姓を入力してください').optional(),
    firstName: z.string().min(1, '名を入力してください').optional(),
    lastNameKana: z.string().optional(),
    firstNameKana: z.string().optional(),
    memberNumber: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    birthDate: z.string().optional(),
    position: z.string().optional(),
    joinDate: z.string().optional(),
    status: z.enum(['invited', 'active', 'inactive', 'withdrawn']).optional(),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    industryClassification: z.string().optional(),
    companyName: z.string().optional(),
    department: z.string().optional(),
    phoneNumber: z.string().optional(),
    hobbies: z.array(z.string()).optional(),
    introduction: z.string().optional(),
    privacySettings: z.object({
      showEmail: z.boolean().optional(),
      showPhone: z.boolean().optional(),
      showBirthDate: z.boolean().optional(),
      showCompany: z.boolean().optional(),
    }).optional(),
  }),
});

export const getMembersSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(['invited', 'active', 'inactive', 'withdrawn']).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>['body'];
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
