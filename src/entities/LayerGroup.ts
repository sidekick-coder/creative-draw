import { createId } from '@/utils/createId'

export default class LayerGroup {
    public id: string
    public project_id: string
    public name: string
    public layer_ids: string[] = []
    public visible: boolean = true
    public order: number = 0
    public created_at: Date | string
    public updated_at: Date | string

    constructor(data?: Partial<LayerGroup>) {
        Object.assign(this, data)

        if (!this.id) {
            this.id = createId()
        }
    }

    public static fromData(data: any): LayerGroup {
        return new LayerGroup(data)
    }
}
