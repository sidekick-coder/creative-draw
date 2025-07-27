import type ThreadItem from '@/entities/ThreadItem'

export interface Filters {
    id?: string
    deleted?: boolean
    threadId?: string
}

export interface ListOptions {
    limit?: number
    offset?: number
    filters?: Filters
}

export default interface ThreadItemRepository {
    list: (options?: ListOptions) => Promise<ThreadItem[]>
    find: (id: string) => Promise<ThreadItem | null>
    create: (data: Partial<Omit<ThreadItem, 'id'>>) => Promise<ThreadItem>
    update: (id: string, data: Partial<Omit<ThreadItem, 'id'>>) => Promise<ThreadItem | null>
    destroy: (id: string) => Promise<void>
}
