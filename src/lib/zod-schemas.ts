import { z } from 'astro/zod';

export const AuthorSchema = z.object({
  id: z.string().uuid(),
  owner_user_id: z.string().uuid().nullable(),
  fullname: z.string().min(2).max(200),
  pseudonyme: z.string().nullable(),
  age: z.number().int().min(0).max(150).nullable(),
  birthdate: z.string().nullable(),
  biography: z.string(),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  created_at: z.string(),
  updated_at: z.string(),
});

export const WorkSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  type: z.enum([
    'short_story',
    'novel',
    'poetry',
    'play',
    'essay',
    'chronicle',
    'anthology',
    'comic',
  ]),
  title: z.string().min(2).max(300),
  genres: z.array(z.number().int()).min(1),
  year: z.number().int().min(1900).max(2100),
  edition_number: z.number().int().nullable(),
  cant_pages: z.number().int().positive().nullable(),
  link: z
    .string()
    .url()
    .refine((value) => value.startsWith('https://'))
    .nullable(),
  created_by: z.string().uuid().nullable(),
  is_published: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const EditorialSchema = z.object({
  id: z.number().int(),
  name: z.string().min(2).max(200),
  country: z.string().nullable(),
  website: z
    .string()
    .url()
    .refine((value) => value.startsWith('https://'))
    .nullable(),
  created_at: z.string(),
});

export type Author = z.infer<typeof AuthorSchema>;
export type Work = z.infer<typeof WorkSchema>;
export type Editorial = z.infer<typeof EditorialSchema>;
