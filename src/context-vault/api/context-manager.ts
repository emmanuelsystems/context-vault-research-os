import { prisma } from '../client.js'

export type ContextLayer = 'RAW' | 'SENSEMAKING' | 'STRUCTURED' | 'APPLICATION'

export const ContextManager = {
  createContextItem: async (data: {
    layer: ContextLayer
    source_type?: string
    title?: string
    project?: string
    people?: string[]
    topics?: string[]
    occurred_at?: string
    content_text?: string
    content_ref?: string
    payload?: any
    created_by?: string
  }) => {
    return prisma.contextItem.create({
      data: {
        layer: data.layer,
        source_type: data.source_type,
        title: data.title,
        project: data.project,
        people: data.people ? JSON.stringify(data.people) : undefined,
        topics: data.topics ? JSON.stringify(data.topics) : undefined,
        occurred_at: data.occurred_at ? new Date(data.occurred_at) : undefined,
        content_text: data.content_text,
        content_ref: data.content_ref,
        payload: data.payload ? JSON.stringify(data.payload) : undefined,
        created_by: data.created_by,
      },
    })
  },

  listContextItems: async (filters?: {
    q?: string
    layer?: string
    project?: string
    from?: string
    to?: string
  }) => {
    const q = filters?.q?.trim()
    const from = filters?.from ? new Date(filters.from) : undefined
    const to = filters?.to ? new Date(filters.to) : undefined

    return prisma.contextItem.findMany({
      where: {
        ...(filters?.layer ? { layer: filters.layer } : {}),
        ...(filters?.project ? { project: filters.project } : {}),
        ...(from || to
          ? {
              occurred_at: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { project: { contains: q, mode: 'insensitive' } },
                { content_text: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ occurred_at: 'desc' }, { created_at: 'desc' }],
    })
  },

  getContextItem: async (id: string) => {
    return prisma.contextItem.findUnique({
      where: { id },
      include: {
        run_links: {
          include: { run: true },
        },
      },
    })
  },

  linkContextToRun: async (data: { run_id: string; context_item_id: string }) => {
    return prisma.runContextLink.upsert({
      where: {
        run_id_context_item_id: {
          run_id: data.run_id,
          context_item_id: data.context_item_id,
        },
      },
      create: {
        run_id: data.run_id,
        context_item_id: data.context_item_id,
      },
      update: {},
    })
  },
}

