import type ThreadImage from '@/entities/ThreadImage'

export interface Filters {
    id?: string
    deleted?: boolean
}

export interface ListOptions {
    limit?: number
    offset?: number
    filters?: Filters
}

export default interface ThreadImageRepository {
    list: (options?: ListOptions) => Promise<ThreadImage[]>
    find: (id: string) => Promise<ThreadImage | null>
    create: (data: Partial<Omit<ThreadImage, 'id'>>) => Promise<ThreadImage>
    update: (id: string, data: Partial<Omit<ThreadImage, 'id'>>) => Promise<ThreadImage | null>
    destroy: (id: string) => Promise<void>
}
