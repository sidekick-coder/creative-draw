import type { ProjectData } from '@/repositories/projectRepository'

export interface IProjectProvider {
    id: string
    label?: string
    icon?: string
    get(id: string): Promise<ProjectData>
    create(id: string, payload: ProjectData): Promise<ProjectData>
    update(id: string, projectData: ProjectData): Promise<ProjectData>
    destroy(id: string): Promise<void>
}
