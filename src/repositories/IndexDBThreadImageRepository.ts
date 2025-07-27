import type { ListOptions } from '@/contracts/ThreadImageRepository'
import type ThreadImageRepository from '@/contracts/ThreadImageRepository'
import ThreadImage from '@/entities/ThreadImage'
import Dexie from 'dexie'

export default class IndexDBThreadImageRepository implements ThreadImageRepository {
    public db: Dexie & {
        thread_images: Dexie.Table<ThreadImage, string>
    }

    constructor(dbName = 'default') {
        this.db = new Dexie(dbName) as Dexie & {
            thread_images: Dexie.Table<ThreadImage, string>
        }

        this.db.version(1).stores({
            thread_images: 'id',
        })
    }

    public async list(options: ListOptions = {}): Promise<ThreadImage[]> {
        let collection = this.db.thread_images.toCollection()

        collection = collection.filter((item) => {
            if (options.filters?.deleted) {
                return item.deletedAt !== null
            }

            return item.deletedAt === null
        })

        if (options.filters?.id) {
            collection = collection.filter((item) => item.id === options.filters!.id)
        }

        const items = await collection.toArray()

        return items.map((item) => ThreadImage.fromData(item))
    }

    public async find(id: string): Promise<ThreadImage | null> {
        const entity = await this.db.thread_images.get(id)

        if (!entity) {
            return null
        }

        return ThreadImage.fromData(entity)
    }

    public async create(data: any): Promise<ThreadImage> {
        const entity = ThreadImage.fromData(data)

        entity.id = createId()
        entity.createdAt = new Date()
        entity.updatedAt = new Date()

        await this.db.thread_images.put(JSON.parse(JSON.stringify(entity)))

        return entity
    }

    public async update(id: string, data: any): Promise<ThreadImage | null> {
        const entity = await this.db.thread_images.get(id)

        if (!entity) {
            throw new Error(`ThreadImage with id ${id} not found`)
        }

        entity.src = data.src || entity.src
        entity.status = data.status || entity.status
        entity.metas = data.metas || entity.metas
        entity.updatedAt = new Date()

        await this.db.thread_images.put(JSON.parse(JSON.stringify(entity)))

        return entity
    }

    public async destroy(id: string): Promise<void> {
        const entity = await this.find(id)

        if (!entity) {
            throw new Error(`ThreadImage with id ${id} not found`)
        }

        entity.deletedAt = new Date()

        await this.db.thread_images.put(JSON.parse(JSON.stringify(entity)))
    }
}
