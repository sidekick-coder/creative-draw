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

    public get icon(): string {
        return Workspace.getIcon(this.type)
    }

    public get typeLabel(): string {
        return Workspace.getTypeLabel(this.type)
    }

    public static getTypeLabel(type: Workspace['type']): string {
        switch (type) {
            case 'index-db':
                return 'Browser Storage'
            case 'filesystem':
                return 'Filesystem'
            default:
                return 'Unknown'
        }
    }

    public static getIcon(type: Workspace['type']): string {
        switch (type) {
            case 'index-db':
                return 'mdi:internet'
            case 'filesystem':
                return 'folder'
            default:
                return 'question'
        }
    }
}
