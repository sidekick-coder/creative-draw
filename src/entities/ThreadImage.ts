export default class ThreadImage {
    public id: string
    public threadId: string
    public src: string | null = null
    public status: 'pending' | 'done' | 'failed'
    public metas: Record<string, any> = {}
    public createdAt: Date = new Date()
    public updatedAt: Date = new Date()
    public deletedAt: Date | null = null

    constructor(data?: Partial<ThreadImage>) {
        Object.assign(this, data)

        if (!this.id) {
            this.id = createId()
        }
    }

    public static fromData(data: any): ThreadImage {
        return new ThreadImage(data)
    }
}
