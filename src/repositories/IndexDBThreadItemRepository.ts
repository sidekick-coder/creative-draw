import type ThreadItemRepository from '@/contracts/ThreadItemRepository'
import type { ListOptions } from '@/contracts/ThreadItemRepository'
import ThreadItem from '@/entities/ThreadItem'
import { createId } from '@/utils/createId'
import Dexie from 'dexie'
import { merge } from 'lodash-es'

export default class IndexDbThreadItemRepository implements ThreadItemRepository {
    public db: Dexie & {
        thread_items: Dexie.Table<ThreadItem, string>
    }

    constructor(dbName = 'default') {
        this.db = new Dexie(dbName) as Dexie & {
            thread_items: Dexie.Table<ThreadItem, string>
        }

        this.db.version(1).stores({
            thread_items: 'id',
        })
    }

    async list(options: ListOptions = {}): Promise<ThreadItem[]> {
        const query = this.db.thread_items

        if (options.filters?.id) {
            query.where('id').equals(options.filters.id)
        }

        if (options.filters?.deleted) {
            query.where('deletedAt').notEqual('')
        }

        if (!options.filters?.deleted) {
            query.where('deletedAt').equals('')
        }

        if (options.filters?.threadId) {
            query.where('threadId').equals(options.filters.threadId)
        }

        const items = await query.toArray()

        return items.map((item) => ThreadItem.fromData(item))
    }

    async find(id: string): Promise<ThreadItem | null> {
        const item = await this.db.thread_items.get(id)

        if (!item) {
            return null
        }

        return ThreadItem.fromData(item)
    }

    async create(data: any): Promise<ThreadItem> {
        const item = ThreadItem.fromData(data)

        item.id = createId()
        item.createdAt = new Date()
        item.updatedAt = new Date()

        await this.db.thread_items.put(item)

        return item
    }

    async update(id: string, data: any): Promise<ThreadItem | null> {
        const item = await this.db.thread_items.get(id)

        if (!item) {
            throw new Error(`Thread with id ${id} not found`)
        }

        item.data = merge({}, item.data, data)

        item.updatedAt = new Date()

        await this.db.thread_items.put(item)

        return item
    }

    async destroy(id: string): Promise<void> {
        await this.db.thread_items.delete(id)
    }
}
