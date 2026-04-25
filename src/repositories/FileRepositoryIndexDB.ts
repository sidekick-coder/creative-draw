import type FileRepository from '@/contracts/FileRepository'
import File from '@/entities/File'
import Dexie from 'dexie'

interface IndexDbFile {
    id: string
    filename: string
    mimetype: string
    createdAt: Date
    updatedAt: Date
    contents: ArrayBuffer
}

export default class FileRepositoryIndexDB implements FileRepository {
    constructor(public table: Dexie.Table<IndexDbFile, string>) {}

    public list: FileRepository['list'] = async (options = {}) => {
        // order by createdAt descending
        let query: any = (this.table as any).reverse()

        if (options.offset) {
            query = query.offset(options.offset)
        }

        if (typeof options.limit === 'number') {
            query = query.limit(options.limit)
        }

        let files = await query.toArray()

        files = files.map((file: any) => File.fromData(file))

        // load src

        for (const file of files) {
            if (!file.contents) {
                continue
            }

            const uint8 = new Uint8Array((file as any).contents)

            const blob = $uint8.toBlob(uint8, file.mimetype)

            file.src = URL.createObjectURL(blob)
        }

        return files
    }

    public async find(fileId: string): Promise<File | null> {
        const file = await this.table.get(fileId)

        if (!file) {
            return null
        }

        return File.fromData(file)
    }

    public async write(contents: Uint8Array, data: Partial<Omit<File, 'id'>>): Promise<File> {
        const file = File.fromData(data as any)

        file.id = file.filename
        file.createdAt = file.createdAt || new Date()
        file.updatedAt = new Date()

        if (!file.mimetype && file.filename) {
            file.mimetype = File.mime(file.filename)
        }

        const saveData: IndexDbFile = {
            ...file,
            contents,
        }

        await this.table.put(saveData, file.id)

        return File.fromData(file)
    }

    public async destroy(fileId: string): Promise<void> {
        const file = await this.table.get(fileId)

        if (!file) {
            return
        }

        await this.table.delete(fileId)
    }
}
