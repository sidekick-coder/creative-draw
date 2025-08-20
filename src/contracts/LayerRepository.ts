import type Layer from '@/entities/Layer'

export interface ListParameters {
    projectId?: string
}

export default interface LayerRepository {
    list(params?: ListParameters): Promise<Layer[]>
    find(id: string): Promise<Layer | null>
    create(data: Partial<Layer>): Promise<Layer>
    update(id: string, data: Partial<Layer>): Promise<Layer | null>
    destroy(id: string): Promise<void>
}
