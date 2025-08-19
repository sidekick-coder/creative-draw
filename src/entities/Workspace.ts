export default class Workspace {
    public id: string
    public name: string
    public type: 'index-db' | 'filesystem'
    public description: string
    public config: Record<string, any> = {}
    public createdAt: Date = new Date()
    public updatedAt: Date = new Date()

    constructor(data?: Partial<Workspace>) {
        Object.assign(this, data)

        if (!this.id) {
            this.id = createId()
        }
    }

    public static fromData(data: any): Workspace {
        return new Workspace(data)
    }
}
