export default class Thread {
    constructor(
        public id: string,
        public title: string,
        public content: string,
        public createdAt: Date,
        public updatedAt: Date
    ) {}

    static fromData(data: any): Thread {
        return new Thread(
            data.id,
            data.title,
            data.content,
            new Date(data.createdAt),
            new Date(data.updatedAt)
        )
    }
}
