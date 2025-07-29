import mime from 'mime'

export default class File {
    public id: string
    public filename: string
    public mimetype: string
    public createdAt: Date = new Date()
    public updatedAt: Date = new Date()

    constructor(data?: Partial<File>) {
        Object.assign(this, data)

        if (!this.id) {
            this.id = createId()
        }

        if (!this.mimetype) {
            this.mimetype = File.mime(this.filename)
        }
    }

    public get src(): string {
        return `drive:${this.filename}`
    }

    public static fromData(data: any): File {
        return new File(data)
    }

    public static mime(filename: string): string {
        return mime.getType(filename) || 'application/octet-stream'
    }

    public static extension(filename: string): string {
        return mime.getExtension(File.mime(filename)) || ''
    }

    public static icon(filename: string): string {
        const ext = File.extension(filename).toLowerCase()

        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
            return 'mdi:image'
        }

        if (['mp4', 'avi', 'mov'].includes(ext)) {
            return 'mdi:video'
        }

        if (['mp3', 'wav'].includes(ext)) {
            return 'mdi:music'
        }

        if (['pdf'].includes(ext)) {
            return 'mdi:file-pdf'
        }

        return 'mdi:file'
    }
}
