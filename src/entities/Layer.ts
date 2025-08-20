import { createId } from '@/utils/createId'

export default class Layer {
    public id: string
    public project_id: string
    public name: string
    public visible: boolean = true
    public order: number = 0
    public opacity: number = 1
    public background_color?: { r: number; g: number; b: number }
    public data: any[] = []
    public created_at: Date | string
    public updated_at: Date | string

    constructor(data?: Partial<Layer>) {
        Object.assign(this, data)

        if (!this.id) {
            this.id = createId()
        }
    }

    public static fromData(data: any): Layer {
        return new Layer(data)
    }
}
