import type { ProjectData } from '~/utils/types'
import type { IProjectProvider } from '../IProjectProvider'
import type { DBProjectData } from '~/utils/db'

export function createProjectProviderIndexDB(): IProjectProvider {
    const get: IProjectProvider['get'] = async (id: string) => {
        const db = await useDb()

        const dbData = await db.project_data.where('project_id').equals(id).first()

        if (!dbData) {
            throw new Error(`Project ${id} not found`)
        }

        const response: ProjectData = {
            name: dbData.name,
            width: dbData.width,
            height: dbData.height,
            thumbnail: dbData.thumbnail,
            layers: dbData.layers,
        }

        return response
    }

    const create: IProjectProvider['create'] = async (id, payload) => {
        const db = await useDb()

        const json: DBProjectData = {
            project_id: id,
            width: payload.width,
            height: payload.height,
            layers: [],
        }

        for await (const layer of payload.layers) {
            json.layers.push(copy(layer))
        }

        await db.project_data.put(json)

        return json
    }

    const update: IProjectProvider['update'] = async (id, payload) => {
        const db = await useDb()
        const dbData = await db.project_data.where('project_id').equals(id).first()

        if (!dbData) {
            throw new Error(`Project ${id} not found`)
        }

        const json: DBProjectData = {
            id: dbData.id,
            project_id: id,
            width: payload.width,
            height: payload.height,
            layers: [],
        }

        for await (const layer of payload.layers) {
            json.layers.push(copy(layer))
        }

        await db.project_data.put(json)
    }

    const destroy: IProjectProvider['destroy'] = async (id) => {
        console.log(`Deleting project ${id} in FSA`)
    }

    return {
        id: 'indexeddb',
        label: 'Memory',
        icon: 'heroicons:circle-stack-solid',
        create,
        get,
        update,
        destroy,
    }
}
