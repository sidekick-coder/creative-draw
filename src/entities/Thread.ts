export default class Thread {
    constructor(
        public id: string,
        public title: string,
        public createdAt: Date,
        public updatedAt: Date,
        public deletedAt: Date | null = null
    ) {}

    static fromData(data: any): Thread {
        return new Thread(data.id, data.title, new Date(data.createdAt), new Date(data.updatedAt))
    }
}
