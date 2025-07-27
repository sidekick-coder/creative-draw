export default class ThreadItem {
    constructor(
        public id: string,
        public threadId: string,
        public type: 'text' | 'image',
        public data: Record<string, any>,
        public createdAt: Date,
        public updatedAt: Date,
        public deletedAt: Date | null = null
    ) {}

    static fromData(data: Partial<ThreadItem>): ThreadItem {
        return new ThreadItem(
            data.id || '',
            data.threadId || '',
            data.type || 'text',
            data.data || {},
            new Date(data.createdAt || Date.now()),
            new Date(data.updatedAt || Date.now()),
            data.deletedAt ? new Date(data.deletedAt) : null
        )
    }
}
