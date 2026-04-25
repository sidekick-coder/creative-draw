import type FileRepository from '@/contracts/FileRepository'
import File from '@/entities/File'
import type { createDrive } from 'drive-fsa'

export default class FileRepositoryFilesystem implements FileRepository {
    constructor(public drive: ReturnType<typeof createDrive>) {}

    public async list(options: any = {}): Promise<File[]> {
        // if no metadata folder, return empty
        if (!(await this.drive.find('/files'))) {
            return []
        }

        const entries = await this.drive.list('/files')
        let files: File[] = []

        for await (const entry of entries) {
            const text = await this.drive.read(`files/${entry.name}/index.json`, {
                contentType: 'text',
            })

            const json = JSON.parse(text)

            files.push(File.fromData(json))
        }

        // sort by createdAt desc
        files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        const offset = options.offset || 0
        const limit = options.limit || files.length

        files = files.slice(offset, offset + limit)

        files = files.map((file) => File.fromData(file))

        for (const file of files) {
            file.src = await this.findDownloadUrl(file)
        }

        return files.slice(offset)
    }

    public async find(fileId: string): Promise<File | null> {
        const entry = await this.drive.find(`/files/${fileId}/index.json`)

        if (!entry) {
            return null
        }

        const text = await this.drive.read(`/files/${fileId}/index.json`, { contentType: 'text' })

        const json = JSON.parse(text)

        return File.fromData(json)
    }

    public async findDownloadUrl(file: File): Promise<string | null> {
        const exists = await this.drive.find(`/files/${file.basename}/content.${file.extension}`)

        if (!exists) return null

        const content = await this.drive.read(`/files/${file.basename}/content.${file.extension}`)

        const blob = $uint8.toBlob(content, file.mimetype)

        return URL.createObjectURL(blob)
    }

    public async findDownloadUrlByFilename(filename: string): Promise<string | null> {
        const basename = File.getBasename(filename)
        const file = await this.find(basename)

        if (!file) return null

        return this.findDownloadUrl(file)
    }

    public async write(contents: Uint8Array, data: Partial<Omit<File, 'fileId'>>): Promise<File> {
        const file = File.fromData(data as any)

        file.createdAt = file.createdAt || new Date()
        file.updatedAt = new Date()

        await this.drive.mkdir(`files/${file.basename}`)
        await this.drive.write(`files/${file.basename}/index.json`, file as any, {
            contentType: 'json',
            recursive: true,
        })
        await this.drive.write(`files/${file.basename}/content.${file.extension}`, contents)

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
