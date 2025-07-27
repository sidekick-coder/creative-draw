import type { ListOptions } from '@/contracts/ThreadRepository'
import type ThreadRepository from '@/contracts/ThreadRepository'
import Thread from '@/entities/Thread'
import { createId } from '@/utils/createId'
import Dexie from 'dexie'

export default class IndexDbThreadRepository implements ThreadRepository {
    public db: Dexie & {
        threads: Dexie.Table<Thread, string>
    }

    constructor(dbName = 'default') {
        this.db = new Dexie(dbName) as Dexie & {
            threads: Dexie.Table<Thread, string>
        }

        this.db.version(1).stores({
            threads: 'id',
        })
    }

    async list(options: ListOptions = {}): Promise<Thread[]> {
        const query = this.db.threads

        if (options.filters?.id) {
            query.where('id').equals(options.filters.id)
        }

        if (options.filters?.deleted) {
            query.where('deletedAt').notEqual('')
        } else {
            query.where('deletedAt').equals('')
        }

        const items = await query.toArray()

        return items.map((item) => Thread.fromData(item))
    }

    async find(id: string): Promise<Thread | null> {
        const thread = await this.db.threads.get(id)

        if (!thread) {
            return null
        }

        return Thread.fromData(thread)
    }

    async create(data: any): Promise<Thread> {
        const thread = Thread.fromData(data)

        thread.id = createId()
        thread.createdAt = new Date()
        thread.updatedAt = new Date()

        await this.db.threads.put(thread)

        return thread
    }

    async update(id: string, data: any): Promise<Thread | null> {
        const thread = await this.db.threads.get(id)

        if (!thread) {
            throw new Error(`Thread with id ${id} not found`)
        }

        thread.title = data.title || thread.title
        thread.updatedAt = new Date()

        await this.db.threads.put(thread)

        return thread
    }

    async destroy(id: string): Promise<void> {
        await this.db.threads.delete(id)
    }
}
