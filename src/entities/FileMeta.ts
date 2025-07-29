export default class FileMeta {
    public fileId: string
    public name: string
    public value: any

    constructor(data?: Partial<FileMeta>) {
        Object.assign(this, data)
    }

    public static fromData(data: any): FileMeta {
        return new FileMeta(data)
    }
}
