import type { createPublicSupabaseClient } from './supabase';
import { AuthorSchema, WorkSchema, type Author } from './zod-schemas';

type SupabaseClient = ReturnType<typeof createPublicSupabaseClient>;

export function throwOnQueryError(error: { message: string } | null) {
  if (error) {
    throw new Error(`Supabase content query failed: ${error.message}`);
  }
}

export async function getAuthors(client: SupabaseClient) {
  const { data, error } = await client
    .from('authors')
    .select('*')
    .order('fullname');
  throwOnQueryError(error);

  return AuthorSchema.array().parse(data);
}

export async function getAuthorBySlug(client: SupabaseClient, slug: string) {
  const { data, error } = await client
    .from('authors')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  throwOnQueryError(error);

  return data === null ? null : AuthorSchema.parse(data);
}

export async function getPublishedWorks(client: SupabaseClient) {
  const { data, error } = await client
    .from('works')
    .select('*')
    .eq('is_published', true)
    .order('year')
    .order('title');
  throwOnQueryError(error);

  return WorkSchema.array().parse(data);
}

export async function getPublishedChronicles(client: SupabaseClient) {
  return (await getPublishedWorks(client)).filter(
    (work) => work.type === 'chronicle',
  );
}

export async function getPublishedWorksWithAuthors(client: SupabaseClient) {
  const works = await getPublishedWorks(client);
  if (works.length === 0) return [];

  const { data: links, error: linkError } = await client
    .from('author_works')
    .select('author_id, work_id')
    .in(
      'work_id',
      works.map(({ id }) => id),
    );
  throwOnQueryError(linkError);

  if (!links) {
    return works.map((work) => ({ ...work, authors: [] }));
  }

  const authorIds = [...new Set(links.map(({ author_id }) => author_id))];
  if (authorIds.length === 0)
    return works.map((work) => ({ ...work, authors: [] }));

  const { data: authorsData, error: authorsError } = await client
    .from('authors')
    .select('*')
    .in('id', authorIds);
  throwOnQueryError(authorsError);

  const authors = AuthorSchema.array().parse(authorsData);
  const authorsById = new Map(authors.map((author) => [author.id, author]));
  const authorsByWork = new Map<string, Author[]>();

  for (const { author_id: authorId, work_id: workId } of links) {
    const author = authorsById.get(authorId);
    if (!author) continue;

    const workAuthors = authorsByWork.get(workId) ?? [];
    workAuthors.push(author);
    authorsByWork.set(workId, workAuthors);
  }

  return works.map((work) => ({
    ...work,
    authors: authorsByWork.get(work.id) ?? [],
  }));
}

export async function getPublishedWorksByAuthor(
  client: SupabaseClient,
  authorId: string,
) {
  const { data: links, error: linkError } = await client
    .from('author_works')
    .select('work_id')
    .eq('author_id', authorId);
  throwOnQueryError(linkError);

  if (!links) return [];

  const workIds = links.map(({ work_id }) => work_id);
  if (workIds.length === 0) return [];

  const { data, error } = await client
    .from('works')
    .select('*')
    .in('id', workIds)
    .eq('is_published', true)
    .order('year')
    .order('title');
  throwOnQueryError(error);

  return WorkSchema.array().parse(data);
}

export async function getPublishedWorkBySlug(
  client: SupabaseClient,
  slug: string,
) {
  const { data, error } = await client
    .from('works')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  throwOnQueryError(error);

  return data === null ? null : WorkSchema.parse(data);
}
