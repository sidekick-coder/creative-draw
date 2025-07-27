export default class Adapter {
    public id: string
    public name: string
    public description: string
    public config: any
    public createdAt: Date = new Date()
    public updatedAt: Date = new Date()
    public deletedAt: Date | null = null

    constructor(data?: Partial<Adapter>) {
        Object.assign(this, data)

        if (!this.id) {
            this.id = createId()
        }
    }

    public static fromData(data: any): Adapter {
        return new Adapter(data)
    }
}
