import type FileMetaRepository from '@/contracts/FileMetaRepository'
import FileMeta from '@/entities/FileMeta'
import Dexie from 'dexie'

export default class IndexDBFileMetaRepository implements FileMetaRepository {
    constructor(public table: Dexie.Table<FileMeta, string>) {}

    public list: FileMetaRepository['list'] = async (options = {}) => {
        let collection = this.table.toCollection()

        if (options.filters?.fileId) {
            collection = collection.filter((item) => item.fileId === options.filters!.fileId)
        }

        if (options.filters?.name) {
            collection = collection.filter((item) => item.name === options.filters!.name)
        }

        if (options.limit) {
            collection = collection.limit(options.limit)
        }

        if (options.offset) {
            collection = collection.offset(options.offset)
        }

        const items = await collection.toArray()

        return items.map((item) => FileMeta.fromData(item))
    }

    public async find(fileId: string): Promise<FileMeta | null> {
        const fileMeta = await this.table.get(fileId)

        if (!fileMeta) {
            return null
        }

        return FileMeta.fromData(fileMeta)
    }

    public findOne: FileMetaRepository['findOne'] = async (filters = {}) => {
        const results = await this.list({
            filters,
            limit: 1,
        })

        return results.length > 0 ? results[0] : null
    }

    public async create(data: any): Promise<FileMeta> {
        const fileMeta = FileMeta.fromData(data)

        await this.table.put(JSON.parse(JSON.stringify(fileMeta)))

        return fileMeta
    }

    public async update(fileId: string, data: any): Promise<FileMeta | null> {
        const fileMeta = await this.table.get(fileId)

        if (!fileMeta) {
            return null
        }

        fileMeta.name = data.name || fileMeta.name
        fileMeta.value = data.value || fileMeta.value

        await this.table.put(JSON.parse(JSON.stringify(fileMeta)))

        return fileMeta
    }

    public async destroy(fileId: string): Promise<void> {
        const fileMeta = await this.table.get(fileId)

        if (!fileMeta) {
            return
        }

        await this.table.delete(fileId)
    }
}
