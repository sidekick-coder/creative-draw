import type { Instruction } from '@/contracts/AdapterRunnerGateway'

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

    public static fromData(data: Partial<ThreadItem>): ThreadItem {
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

    public toInstruction(): Instruction[] {
        const instructions: Instruction[] = []

        if (this.type === 'text') {
            instructions.push({
                type: 'text',
                data: this.data.text || '',
            })
        }

        if (this.type === 'image') {
            instructions.push({
                type: 'image',
                data: this.data.file,
            })
        }

        if (this.type === 'gallery') {
            this.data.files.forEach((file: any) => {
                instructions.push({
                    type: 'image',
                    data: file,
                })
            })
        }

        return instructions
    }
}
