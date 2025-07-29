import type DriveGateway from '@/contracts/DriveGateway'
import Dexie from 'dexie'
import File from '@/entities/File'
import mime from 'mime'

interface DBFile extends File {
    contents: ArrayBuffer
}

export default class IndexDbDriveGateway implements DriveGateway {
    public table: Dexie.Table<DBFile, string>

    constructor(dbName = 'default') {
        const db = new Dexie(dbName) as Dexie & {
            files: Dexie.Table<DBFile, string>
        }

        db.version(1).stores({
            files: 'id,filename,createdAt',
        })

        this.table = db.files
    }

    public list: DriveGateway['list'] = async (options = {}) => {
        let query = this.table.orderBy('createdAt').reverse()

        if (options.offset) {
            query = query.offset(options.offset)
        }

        if (typeof options.limit === 'number') {
            query = query.limit(options.limit)
        }

        const files = await query.toArray()

        return files.map((file) => File.fromData(file))
    }

    public exists: DriveGateway['exists'] = async (filename) => {
        const file = await this.table.where('filename').equals(filename).first()

        if (file) {
            return true
        }

        return false
    }

    public find: DriveGateway['find'] = async (filename) => {
        const file = await this.table.where('filename').equals(filename).first()

        if (file) {
            return File.fromData(file)
        }

        return null
    }

    public write: DriveGateway['write'] = async (filename, contents) => {
        let file = await this.find(filename)

        if (!file) {
            file = File.fromData({
                filename,
                mimetype: mime.getType(filename) || '',
                createdAt: new Date(),
                updatedAt: new Date(),
            })
        }

        if (file) {
            file.updatedAt = new Date()
        }

        // Store contents as ArrayBuffer in a separate field
        // Dexie doesn't support Uint8Array directly, so convert to ArrayBuffer
        const fileToSave = {
            ...file,
            contents: contents.buffer,
        }

        await this.table.put(fileToSave as any)

        return File.fromData(fileToSave)
    }

    public read: DriveGateway['read'] = async (filename) => {
        const file = await this.table.where('filename').equals(filename).first()

        if (file && (file as any).contents) {
            return new Uint8Array((file as any).contents)
        }

        return null
    }

    public destroy: DriveGateway['destroy'] = async (filename) => {
        const file = await this.table.where('filename').equals(filename).first()
        if (!file) {
            return
        }
        await this.table.delete(file.id)
    }
}
