import type File from '@/entities/File'

export interface ListOptions {
    limit?: number
    offset?: number
}

export default interface FileRepository {
    list: (options?: ListOptions) => Promise<File[]>
    find: (fileId: string) => Promise<File | null>
    findDownloadUrl: (file: File) => Promise<string | null>
    findDownloadUrlByFilename: (filename: string) => Promise<string | null>
    write: (contents: Uint8Array, data: Partial<Omit<File, 'id'>>) => Promise<File>
    destroy: (fileId: string) => Promise<void>
}
