import type FileRepository from '@/contracts/FileRepository'
import File from '@/entities/File'
import type { createDrive } from 'drive-fsa'

export default class FileRepositoryFilesystem implements FileRepository {
    constructor(public drive: ReturnType<typeof createDrive>) {}

    public async list(options: any = {}): Promise<File[]> {
        // if no metadata folder, return empty
        if (!(await this.drive.find('files'))) {
            return []
        }

        const entries = await this.drive.list('files')
        const files: File[] = []

        for await (const entry of entries) {
            try {
                const text = await this.drive.read(`files/${entry.name}`, { contentType: 'text' })
                const json = JSON.parse(text)
                files.push(File.fromData(json))
            } catch (err) {
                // skip invalid metadata
            }
        }

        // sort by createdAt desc
        files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        const offset = options.offset || 0

        if (typeof options.limit === 'number') {
            return files.slice(offset, offset + options.limit)
        }

        return files.slice(offset)
    }

    public async find(fileId: string): Promise<File | null> {
        const entry = await this.drive.find(`files/${fileId}.json`)

        if (!entry) {
            return null
        }

        const text = await this.drive.read(`files/${fileId}.json`, { contentType: 'text' })
        const json = JSON.parse(text)

        return File.fromData(json)
    }

    public async create(data: Partial<Omit<File, 'fileId'>>): Promise<File> {
        const file = File.fromData(data as any)

        file.createdAt = file.createdAt || new Date()
        file.updatedAt = new Date()

        if (!(await this.drive.find('files'))) {
            await this.drive.mkdir('files')
        }

        await this.drive.write(`files/${file.id}.json`, file as any, { contentType: 'json' })

        return File.fromData(file)
    }

    public async update(fileId: string, data: Partial<Omit<File, 'fileId'>>): Promise<File | null> {
        const file = await this.find(fileId)

        if (!file) {
            return null
        }

        Object.assign(file, data)

        file.updatedAt = new Date()

        await this.drive.write(`files/${file.id}.json`, file as any, { contentType: 'json' })

        return File.fromData(file)
    }

    public async destroy(fileId: string): Promise<void> {
        const file = await this.find(fileId)

        if (!file) {
            throw new Error(`File with id ${fileId} not found`)
        }

        // remove content if present
        if (file.filename) {
            try {
                await this.drive.destroy(file.filename)
            } catch (err) {
                // ignore errors deleting content
            }
        }

        await this.drive.destroy(`files/${file.id}.json`)
    }
}
