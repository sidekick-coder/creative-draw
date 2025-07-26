import type { ThreadRepositoryListOptions } from '@/contracts/ThreadRepository'
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

    async list(options: ThreadRepositoryListOptions = {}): Promise<Thread[]> {
        const query = this.db.threads

        if (options.filters?.id) {
            query.where('id').equals(options.filters.id)
        }

        const items = await query.toArray()

        return items.map((item) => Thread.fromData(item))
    }

    async find(id: string): Promise<Thread | null> {
        throw new Error('Method not implemented.') // Implementation for finding a thread by ID
    }

    async create(data: any): Promise<Thread> {
        const thread = new Thread(
            data.id || createId(),
            data.title,
            data.content,
            new Date(),
            new Date()
        )

        await this.db.threads.put(thread)

        return thread
    }

    async update(id: string, data: any): Promise<Thread | null> {
        // Implementation for updating a thread
        throw new Error('Method not implemented.') // Implementation for listing threads
    }

    async destroy(id: string): Promise<void> {
        // Implementation for deleting a thread
        throw new Error('Method not implemented.') // Implementation for listing threads
    }
}
