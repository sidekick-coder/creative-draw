import type { Dexie, EntityTable } from 'dexie'
import { createProjectThumbnail } from './createProjectThumbnail'

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
        create: async (payload) => {
            const id = createId()

            const project = {
                name: payload.name,
                ...payload,
                id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }

            await db.projects.add(project)

            return project
        },
        update: async (id: string, payload: Partial<Omit<Store, 'id'>>) => {
            const project = await db.projects.get(id)

            const newProject: any = {
                ...project,
                ...payload,
                id,
                updated_at: new Date().toISOString(),
            }

            if (newProject.layers) {
                newProject.thumbnail = await createProjectThumbnail(
                    newProject.width,
                    newProject.height,
                    newProject.layers
                )
            }

            await db.projects.update(id, newProject)
        },
        destroy: async (id) => {
            await db.projects.delete(id)
        },
    })
}
