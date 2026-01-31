import { z } from 'zod';

export const createEventSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'タイトルを入力してください' }).min(1, 'タイトルを入力してください'),
    description: z.string().optional(),
    eventType: z.enum(['regular_meeting', 'special_event', 'board_meeting', 'social', 'other']),
    startAt: z.string({ required_error: '開始日時を入力してください' }),
    endAt: z.string().optional(),
    venue: z.string().optional(),
    venueAddress: z.string().optional(),
    onlineUrl: z.string().url('正しいURLを入力してください').optional().or(z.literal('')),
    responseDeadline: z.string().optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const updateEventSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    title: z.string().min(1, 'タイトルを入力してください').optional(),
    description: z.string().optional(),
    eventType: z.enum(['regular_meeting', 'special_event', 'board_meeting', 'social', 'other']).optional(),
    startAt: z.string().optional(),
    endAt: z.string().optional(),
    venue: z.string().optional(),
    venueAddress: z.string().optional(),
    onlineUrl: z.string().url('正しいURLを入力してください').optional().or(z.literal('')),
    responseDeadline: z.string().optional(),
    isPublished: z.boolean().optional(),
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
