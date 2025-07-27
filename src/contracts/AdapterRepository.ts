import type Adapter from '@/entities/Adapter'

export interface Filters {
    id?: string
    deleted?: boolean
}

export interface ListOptions {
    limit?: number
    offset?: number
    filters?: Filters
}

export default interface AdapterRepository {
    list: (options?: ListOptions) => Promise<Adapter[]>
    find: (id: string) => Promise<Adapter | null>
    create: (data: Partial<Omit<Adapter, 'id'>>) => Promise<Adapter>
    update: (id: string, data: Partial<Omit<Adapter, 'id'>>) => Promise<Adapter | null>
    destroy: (id: string) => Promise<void>
}
