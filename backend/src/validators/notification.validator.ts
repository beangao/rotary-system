import { z } from 'zod';

export const createNotificationSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'タイトルを入力してください' }).min(1, 'タイトルを入力してください'),
    content: z.string({ required_error: '本文を入力してください' }).min(1, '本文を入力してください'),
    category: z.enum(['general', 'important', 'event', 'other']).optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const updateNotificationSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    title: z.string().min(1, 'タイトルを入力してください').optional(),
    content: z.string().min(1, '本文を入力してください').optional(),
    category: z.enum(['general', 'important', 'event', 'other']).optional(),
    isPublished: z.boolean().optional(),
  }),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>['body'];
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>['body'];
