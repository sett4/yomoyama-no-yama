import { and, desc, eq } from "drizzle-orm"
import { DbClient } from "./client"
import { generateId } from "./ids"
import { categories, postExtras, posts, POST_EXTRA_TYPE, PostExtraType } from "./schema"

export { POST_EXTRA_TYPE }

export type DbCategory = typeof categories.$inferSelect
export type DbPost = typeof posts.$inferSelect
export type DbPostExtra = typeof postExtras.$inferSelect

export type UpsertPostInput = {
  categoryId: string
  publishedAt: Date
  title: string
  content: string | null
  contentType: string
  rawContent: string | null
  published: boolean
  author: string
  source: string
  sourceUrl: string
  slug: string
  scraper: string
  tags: string
}

function logQueryError(context: string, error: unknown, metadata: Record<string, unknown>) {
  const details =
    error && typeof error === "object"
      ? {
          name: (error as { name?: unknown }).name,
          message: (error as { message?: unknown }).message,
          code: (error as { code?: unknown }).code,
          causeMessage: (
            (error as { cause?: { message?: unknown } }).cause || {}
          ).message,
          causeCode: ((error as { cause?: { code?: unknown } }).cause || {}).code,
        }
      : { message: String(error) }

  console.error(`[db] ${context} failed`, {
    ...metadata,
    ...details,
  })
}

export async function ensureCategory(
  db: DbClient,
  name: string
): Promise<DbCategory> {
  const existing = await db
    .select()
    .from(categories)
    .where(eq(categories.name, name))
    .limit(1)

  if (existing[0]) {
    return existing[0]
  }

  const id = generateId()
  await db.insert(categories).values({ id, name }).onConflictDoNothing()

  const created = await db
    .select()
    .from(categories)
    .where(eq(categories.name, name))
    .limit(1)

  if (!created[0]) {
    throw new Error(`Category not found after upsert: ${name}`)
  }

  return created[0]
}

export async function getCategoryByName(
  db: DbClient,
  name: string
): Promise<DbCategory> {
  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.name, name))
    .limit(1)

  if (!result[0]) {
    throw new Error(`Category not found: ${name}`)
  }

  return result[0]
}

export async function upsertPost(
  db: DbClient,
  input: UpsertPostInput
): Promise<void> {
  const now = new Date()
  await db
    .insert(posts)
    .values({
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      publishedAt: input.publishedAt,
      title: input.title,
      content: input.content,
      contentType: input.contentType,
      categoryId: input.categoryId,
      rawContent: input.rawContent,
      published: input.published,
      author: input.author,
      source: input.source,
      sourceUrl: input.sourceUrl,
      slug: input.slug,
      scraper: input.scraper,
      tags: input.tags,
    })
    .onConflictDoUpdate({
      target: [posts.categoryId, posts.slug],
      set: {
        updatedAt: now,
        publishedAt: input.publishedAt,
        title: input.title,
        content: input.content,
        contentType: input.contentType,
        rawContent: input.rawContent,
        published: input.published,
        author: input.author,
        source: input.source,
        sourceUrl: input.sourceUrl,
        scraper: input.scraper,
        tags: input.tags,
      },
    })
}

export async function findPublishedPostsByCategoryAndSource(
  db: DbClient,
  categoryName: string,
  source: string
): Promise<DbPost[]> {
  try {
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.name, categoryName))
      .limit(1)
    const category = existingCategory[0]
    if (!category) {
      console.warn("[db] category not found", { categoryName, source })
      return []
    }
    return db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.published, true),
          eq(posts.categoryId, category.id),
          eq(posts.source, source)
        )
      )
      .orderBy(desc(posts.publishedAt))
  } catch (error) {
    logQueryError("findPublishedPostsByCategoryAndSource", error, {
      categoryName,
      source,
    })
    throw error
  }
}

export async function findPublishedPostsByCategory(
  db: DbClient,
  categoryName: string
): Promise<DbPost[]> {
  try {
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.name, categoryName))
      .limit(1)
    const category = existingCategory[0]
    if (!category) {
      console.warn("[db] category not found", { categoryName })
      return []
    }
    return db
      .select()
      .from(posts)
      .where(and(eq(posts.published, true), eq(posts.categoryId, category.id)))
      .orderBy(desc(posts.publishedAt))
  } catch (error) {
    logQueryError("findPublishedPostsByCategory", error, { categoryName })
    throw error
  }
}

export async function findPostExtraById(
  db: DbClient,
  id: string
): Promise<DbPostExtra | null> {
  const result = await db
    .select()
    .from(postExtras)
    .where(eq(postExtras.id, id))
    .limit(1)
  return result[0] || null
}

export async function upsertPostExtra(
  db: DbClient,
  input: { id: string; type?: PostExtraType; content: string | null }
) {
  await db
    .insert(postExtras)
    .values({
      id: input.id,
      type: input.type || POST_EXTRA_TYPE.INCIDENT_GPT,
      content: input.content,
    })
    .onConflictDoUpdate({
      target: postExtras.id,
      set: {
        type: input.type || POST_EXTRA_TYPE.INCIDENT_GPT,
        content: input.content,
      },
    })
}
