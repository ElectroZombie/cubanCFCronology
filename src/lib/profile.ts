import { z } from 'astro/zod';

/**
 * Validation schema for an author's own profile fields.
 *
 * Used by the profile form on both the client (immediate feedback) and, later,
 * the server handler that writes to `public.authors`. The field limits mirror
 * the checks in the database migration.
 */
export const ProfileSchema = z.object({
  fullname: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  pseudonyme: z
    .string()
    .max(100, 'El pseudónimo no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  biography: z
    .string()
    .max(1000, 'La biografía no puede exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
});

export type Profile = z.infer<typeof ProfileSchema>;

/**
 * Validate a profile payload and return the parsed value.
 * @param input Raw form values.
 * @returns The parsed profile, or a list of error messages.
 */
export function parseProfile(
  input: unknown,
): { ok: true; data: Profile } | { ok: false; errors: string[] } {
  const result = ProfileSchema.safeParse(input);

  if (result.success) {
    return { ok: true, data: result.data };
  }

  return {
    ok: false,
    errors: result.error.issues.map((issue) => issue.message),
  };
}
