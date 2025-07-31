import type FileMeta from '@/entities/FileMeta'

export interface Filters {
    fileId?: string
    name?: string
}

export interface ListOptions {
    limit?: number
    offset?: number
    filters?: Filters
}

export default interface FileMetaRepository {
    list: (options?: ListOptions) => Promise<FileMeta[]>
    find: (fileId: string) => Promise<FileMeta | null>
    findOne: (filters: Filters) => Promise<FileMeta | null>
    create: (data: Partial<Omit<FileMeta, 'fileId'>>) => Promise<FileMeta>
    update: (fileId: string, data: Partial<Omit<FileMeta, 'fileId'>>) => Promise<FileMeta | null>
    destroy: (fileId: string) => Promise<void>
}
