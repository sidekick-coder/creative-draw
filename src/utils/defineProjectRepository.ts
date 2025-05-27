export interface ProjectRepository {
    list: () => Promise<any[]>
    get: (id: string) => Promise<any | null>
    create: (data: any) => Promise<any>
    update: (id: string, data: any) => Promise<any | null>
    destroy: (id: string) => Promise<void>
}

export function defineProjectRepository(repository: ProjectRepository) {
    return repository
}
