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
            layers: [],
        }

        for await (const layer of dbData.layers) {
            const canvas = document.createElement('canvas')

            canvas.width = layer.width
            canvas.height = layer.height

            const ctx = canvas.getContext('2d')!

            const imageData = new ImageData(layer.data, layer.width, layer.height)

            ctx.putImageData(imageData, 0, 0)

            response.layers.push({
                ...layer,
                canvas,
            })
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
            const ctx = layer.canvas.getContext('2d')!

            const data = ctx.getImageData(0, 0, layer.width, layer.height).data

            json.layers.push({
                ...layer,
                canvas: undefined,
                data: data,
            } as any)
        }

        const thumbnail = await projectToImage({
            project: payload as ProjectData,
            type: 'png',
            responseType: 'base64',
        })

        json.thumbnail = thumbnail as string

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
            const ctx = layer.canvas.getContext('2d')!

            const data = ctx.getImageData(0, 0, layer.width, layer.height).data

            json.layers.push({
                ...layer,
                canvas: undefined,
                data: data,
            } as any)
        }

        const thumbnail = await projectToImage({
            project: payload as ProjectData,
            type: 'png',
            responseType: 'base64',
        })

        json.thumbnail = thumbnail as string

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
