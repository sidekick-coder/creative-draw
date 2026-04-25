export default class Project {
    public id: string
    public thumbnailSrc: string;
    [key: string]: any

    constructor(data?: Partial<Project>) {
        Object.assign(this, data)

        if (!this.id) {
            this.id = createId()
        }
    }

    public static fromData(data: any): Project {
        return new Project(data)
    }
}
