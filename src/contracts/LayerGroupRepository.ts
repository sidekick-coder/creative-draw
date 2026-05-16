import type LayerGroup from '@/entities/LayerGroup'

export interface ListParameters {
    projectId?: string
}

export default interface LayerGroupRepository {
    list(params?: ListParameters): Promise<LayerGroup[]>
    find(id: string): Promise<LayerGroup | null>
    create(data: Partial<LayerGroup>): Promise<LayerGroup>
    update(id: string, data: Partial<LayerGroup>): Promise<LayerGroup | null>
    destroy(id: string): Promise<void>
}
