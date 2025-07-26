import type Thread from '@/entities/Thread'

export interface ThreadRepositoryFilters {
    id?: string
}

export interface ThreadRepositoryListOptions {
    limit?: number
    offset?: number
    filters?: ThreadRepositoryFilters
}

export default interface ThreadRepository {
    list: (options?: ThreadRepositoryListOptions) => Promise<Thread[]>
    find: (id: string) => Promise<Thread | null>
    create: (data: Partial<Omit<Thread, 'id'>>) => Promise<Thread>
    update: (id: string, data: Partial<Omit<Thread, 'id'>>) => Promise<Thread | null>
    destroy: (id: string) => Promise<void>
}
