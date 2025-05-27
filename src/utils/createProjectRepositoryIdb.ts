import type { Dexie, EntityTable } from 'dexie'

interface Store {
    id: string
    name: string
    width: number
    height: number
}

interface Instance {
    projects: EntityTable<Store, 'id'>
}

export function createProjectRepositoryIdb(db: Dexie & Instance) {
    return defineProjectRepository({
        list: async () => {
            return await db.projects.toArray()
        },
        get: async (id) => {
            return (await db.projects.get(id)) || null
        },
        create: async (project) => {
            const id = await db.projects.add(project)

            return { ...project, id }
        },
        update: async (id: string, project: Partial<Omit<Store, 'id'>>) => {
            await db.projects.update(id, project)
        },
        destroy: async (id) => {
            await db.projects.delete(id)
        },
    })
}
