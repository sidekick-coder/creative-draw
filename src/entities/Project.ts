export default class Project {
    public id: string
    public thumbnailSrc: string | null;
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

    public get thumbnailFilename(): string {
        return `projects-thumbnail-${this.id}.png`
    }
}
