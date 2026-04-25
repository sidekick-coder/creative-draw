import type LayerRepository from '@/contracts/LayerRepository'
import type { ListParameters } from '@/contracts/LayerRepository'
import Layer from '@/entities/Layer'
import { createId } from '@/utils/createId'
import type { createDrive } from 'drive-fsa'

export default class LayerRepositoryFilesystem implements LayerRepository {
    constructor(public drive: ReturnType<typeof createDrive>) {}

    public async readLayerJson(projectId: string, layerId: string): Promise<Layer> {
        const text = await this.drive.read(`projects/${projectId}/layers/${layerId}/index.json`, {
            contentType: 'text',
        })

        const json = JSON.parse(text)

        // data
        const dataFiles = await this.drive.list(`projects/${projectId}/layers/${layerId}/data`)

        const data = [] as any[]

        for await (const dataFile of dataFiles) {
            const dataText = await this.drive.read(
                `projects/${projectId}/layers/${layerId}/data/${dataFile.name}`,
                {
                    contentType: 'text',
                }
            )

            const dataJson = JSON.parse(dataText)

            data.push(dataJson)
        }

        json.data = data

        return Layer.fromData(json)
    }

    public async list(params?: ListParameters): Promise<Layer[]> {
        const projectFolders = await this.drive.list('projects')
        const layerFolders = [] as { projectId: string; name: string }[]

        const layers = [] as Layer[]

        for await (const projectFolder of projectFolders) {
            if (params?.projectId && projectFolder.name !== params.projectId) {
                continue
            }

            if (!(await this.drive.find(`projects/${projectFolder.name}/layers`))) {
                continue
            }

            const projectLayerFolders = await this.drive.list(
                `projects/${projectFolder.name}/layers`
            )

            for await (const layerFolder of projectLayerFolders) {
                layerFolders.push({
                    projectId: projectFolder.name,
                    name: layerFolder.name,
                })
            }
        }

        for await (const layerFolder of layerFolders) {
            const json = await this.readLayerJson(layerFolder.projectId, layerFolder.name)

            const layer = Layer.fromData(json)

            layers.push(layer)
        }

        return layers
    }

    public async find(id: string): Promise<Layer | null> {
        const layers = await this.list()

        const layer = layers.find((layer) => layer.id === id)

        return layer || null
    }

    public async create(payload: Partial<Layer>): Promise<Layer> {
        const layer = Layer.fromData(payload)

        layer.id = createId()
        layer.created_at = new Date()
        layer.updated_at = new Date()

        const savedLayer = {
            ...layer,
            data: undefined,
        }

        await this.drive.mkdir(`projects/${layer.project_id}/layers`)
        await this.drive.mkdir(`projects/${layer.project_id}/layers/${layer.id}`)
        await this.drive.write(
            `projects/${layer.project_id}/layers/${layer.id}/index.json`,
            savedLayer as any,
            {
                contentType: 'json',
            }
        )

        await this.drive.mkdir(`projects/${layer.project_id}/layers/${layer.id}/data`)

        for await (const o of layer.data || []) {
            const filename = `projects/${layer.project_id}/layers/${layer.id}/data/${o.id}.json`

            await this.drive.write(filename, o as any, {
                contentType: 'json',
            })
        }

        return layer
    }

    public async update(id: string, payload: Partial<Layer>): Promise<Layer | null> {
        const layer = await this.find(id)

        if (!layer) {
            throw new Error(`Layer with id ${id} not found`)
        }

        Object.assign(layer, payload)

        layer.updated_at = new Date()

        const savedLayer = {
            ...layer,
            data: undefined,
        }

        const filePath = `projects/${layer.project_id}/layers/${layer.id}/index.json`

        await this.drive.write(filePath, savedLayer as any, {
            contentType: 'json',
        })

        for await (const o of layer.data || []) {
            const filename = `projects/${layer.project_id}/layers/${layer.id}/data/${o.id}.json`

            await this.drive.write(filename, o as any, {
                contentType: 'json',
                recursive: true,
            })
        }

        return layer
    }

    public async destroy(id: string): Promise<void> {
        const layer = await this.find(id)

        if (!layer) {
            throw new Error(`Layer with id ${id} not found`)
        }

        await this.drive.destroy(`projects/${layer.project_id}/layers/${layer.id}`)
    }
}
