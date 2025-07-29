import type FileMeta from '@/entities/FileMeta'

export interface FileMetaFilters {
    fileId?: string
    name?: string
}

export interface FileMetaListOptions {
    limit?: number
    offset?: number
    filters?: FileMetaFilters
}

export default interface FileMetaRepository {
    list: (options?: FileMetaListOptions) => Promise<FileMeta[]>
    find: (fileId: string) => Promise<FileMeta | null>
    create: (data: Partial<Omit<FileMeta, 'fileId'>>) => Promise<FileMeta>
    update: (fileId: string, data: Partial<Omit<FileMeta, 'fileId'>>) => Promise<FileMeta | null>
    destroy: (fileId: string) => Promise<void>
}
