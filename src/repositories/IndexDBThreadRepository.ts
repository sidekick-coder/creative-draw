import type { ListOptions } from '@/contracts/ThreadRepository'
import type ThreadRepository from '@/contracts/ThreadRepository'
import Thread from '@/entities/Thread'
import { createId } from '@/utils/createId'
import Dexie from 'dexie'

export default class IndexDbThreadRepository implements ThreadRepository {
    constructor(public table: Dexie.Table<Thread, string>) {}

    public async list(options: ListOptions = {}): Promise<Thread[]> {
        let collection = this.table.toCollection()

        if (options.filters?.id) {
            collection = collection.filter((item) => item.id === options.filters!.id)
        }

        if (options.filters?.deleted) {
            collection = collection.filter((item) => item.deletedAt !== null)
        }

        if (!options.filters?.deleted) {
            collection = collection.filter((item) => !item.deletedAt)
        }

        const items = await collection.toArray()

        return items.map((item) => Thread.fromData(item))
    }

    public async find(id: string): Promise<Thread | null> {
        const thread = await this.table.get(id)

        if (!thread) {
            return null
        }

        return Thread.fromData(thread)
    }

    public async create(data: any): Promise<Thread> {
        const thread = Thread.fromData(data)

        thread.id = createId()
        thread.createdAt = new Date()
        thread.updatedAt = new Date()

        await this.table.put(thread)

        return thread
    }

    public async update(id: string, data: any): Promise<Thread | null> {
        const thread = await this.table.get(id)

        if (!thread) {
            throw new Error(`Thread with id ${id} not found`)
        }

        thread.title = data.title || thread.title
        thread.updatedAt = new Date()

        await this.table.put(thread)

        return thread
    }

    public async destroy(id: string): Promise<void> {
        await this.table.delete(id)
    }
}
