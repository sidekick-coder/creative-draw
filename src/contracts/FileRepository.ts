import type File from '@/entities/File'

export interface ListOptions {
    limit?: number
    offset?: number
}

export default interface FileRepository {
    list: (options?: ListOptions) => Promise<File[]>
    find: (fileId: string) => Promise<File | null>
    create: (contents: Uint8Array, data: Partial<Omit<File, 'id'>>) => Promise<File>
    update: (fileId: string, data: Partial<Omit<File, 'id'>>) => Promise<File | null>
    destroy: (fileId: string) => Promise<void>
}
