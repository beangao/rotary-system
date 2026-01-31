import { z } from 'zod';

// イベント種別
const eventTypeEnum = z.enum(['meeting', 'service', 'social', 'district', 'other']);

// ステータス
const statusEnum = z.enum(['draft', 'published', 'closed', 'cancelled', 'postponed']);

export const createEventSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'タイトルを入力してください' }).min(1, 'タイトルを入力してください'),
    description: z.string().optional().nullable(),
    eventType: eventTypeEnum,
    startAt: z.string({ required_error: '開始日時を入力してください' }),
    endAt: z.string().optional().nullable(),
    venue: z.string().optional().nullable(),
    venueAddress: z.string().optional().nullable(),
    onlineUrl: z.string().url('正しいURLを入力してください').optional().nullable().or(z.literal('')),
    responseDeadline: z.string().optional().nullable(),
    status: statusEnum.optional().default('draft'),
    isPublished: z.boolean().optional(),
    originalDate: z.string().optional().nullable(),
    postponedDate: z.string().optional().nullable(),
    attachmentUrl: z.string().optional().nullable(),
    attachmentName: z.string().optional().nullable(),
  }),
});

export const updateEventSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    title: z.string().min(1, 'タイトルを入力してください').optional(),
    description: z.string().optional().nullable(),
    eventType: eventTypeEnum.optional(),
    startAt: z.string().optional(),
    endAt: z.string().optional().nullable(),
    venue: z.string().optional().nullable(),
    venueAddress: z.string().optional().nullable(),
    onlineUrl: z.string().url('正しいURLを入力してください').optional().nullable().or(z.literal('')),
    responseDeadline: z.string().optional().nullable(),
    status: statusEnum.optional(),
    isPublished: z.boolean().optional(),
    originalDate: z.string().optional().nullable(),
    postponedDate: z.string().optional().nullable(),
    attachmentUrl: z.string().optional().nullable(),
    attachmentName: z.string().optional().nullable(),
  }),
});

export const attendanceSchema = z.object({
  body: z.object({
    status: z.enum(['attending', 'absent', 'undecided']),
    comment: z.string().optional(),
  }),
});

export type CreateEventInput = z.infer<typeof createEventSchema>['body'];
export type UpdateEventInput = z.infer<typeof updateEventSchema>['body'];
export type AttendanceInput = z.infer<typeof attendanceSchema>['body'];
