import type File from '@/entities/File'

export interface ListOptions {
    limit?: number
    offset?: number
}

export default interface DriveGateway {
    list: (options?: ListOptions) => Promise<File[]>
    exists: (filename: string) => Promise<boolean>
    find: (filename: string) => Promise<File | null>
    write: (filename: string, contents: Uint8Array) => Promise<File>
    read: (filename: string) => Promise<Uint8Array | null>
    destroy: (filename: string) => Promise<void>
}
