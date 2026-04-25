import mime from 'mime'

export default class File {
    public id: string
    public filename: string
    public mimetype: string
    public src: string | null // This is a placeholder property for the file's data URL or blob URL. It should be set when the file is loaded.
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

    public get extension(): string {
        return File.getExtension(this.filename)
    }

    public get basename(): string {
        return File.getBasename(this.filename)
    }

    public static fromData(data: any): File {
        return new File(data)
    }

    public static mime(filename: string): string {
        return mime.getType(filename) || 'application/octet-stream'
    }

    public static getExtension(filename: string): string {
        return mime.getExtension(File.mime(filename)) || ''
    }

    public static getBasename(filename: string): string {
        const ext = File.getExtension(filename)

        if (ext) {
            return filename.substring(0, filename.length - ext.length - 1)
        }

        return filename
    }

    public static icon(filename: string): string {
        const ext = File.getExtension(filename).toLowerCase()

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

    public static getFilenameWithoutExtension(filename: string): string {
        const lastDotIndex = filename.lastIndexOf('.')

        if (lastDotIndex === -1) {
            return filename
        }

        return filename.substring(0, lastDotIndex)
    }
}
