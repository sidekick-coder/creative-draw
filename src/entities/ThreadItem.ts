import type { Instruction } from '@/contracts/AdapterRunnerGateway'

export default class ThreadItem {
    public id: string
    public threadId: string
    public type: 'text' | 'image' | 'gallery'
    public data: Record<string, any> = {}
    public createdAt: Date
    public updatedAt: Date
    public deletedAt: Date | null = null
    public order: number = 999

    constructor(data?: Partial<ThreadItem>) {
        Object.assign(this, data)

        if (!this.id) {
            this.id = createId()
        }
    }

    public static fromData(data: any): ThreadItem {
        return new ThreadItem(data)
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
