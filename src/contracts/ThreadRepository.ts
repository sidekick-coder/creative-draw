import type Thread from '@/entities/Thread'

export interface Filters {
    id?: string
    deleted?: boolean
}

export interface ListOptions {
    limit?: number
    offset?: number
    filters?: Filters
}

export default interface ThreadRepository {
    list: (options?: ListOptions) => Promise<Thread[]>
    find: (id: string) => Promise<Thread | null>
    create: (data: Partial<Omit<Thread, 'id'>>) => Promise<Thread>
    update: (id: string, data: Partial<Omit<Thread, 'id'>>) => Promise<Thread | null>
    destroy: (id: string) => Promise<void>
}
