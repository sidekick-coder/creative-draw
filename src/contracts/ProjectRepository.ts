import type Project from '@/entities/Project'

export default interface ProjectRepository {
    list: () => Promise<Project[]>
    find: (id: string) => Promise<Project | null>
    create: (data: any) => Promise<Project>
    update: (id: string, data: any) => Promise<Project | null>
    destroy: (id: string) => Promise<void>
}
