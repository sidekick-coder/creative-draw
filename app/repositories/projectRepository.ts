import { createDrive, destroyEntry, findEntry, makeDirectoryEntry, readEntry } from 'drive-fsa'
import type { Layer } from '@/composables/useInstance'

export interface Project {
    id: string
    type: string
}

export interface ProjectFileSystem extends Project {
    type: 'filesystem'
    handle: FileSystemDirectoryHandle
}

export interface ProjectData extends Project {
    width: number
    height: number
    layers: Layer[]
}

export async function findProject(id: string): Promise<ProjectData> {
    const dbProject = await $db.projects.get(id)

    if (!dbProject) {
        throw new Error('Project not found')
    }

    if (dbProject.type === 'filesystem') {
        const handle = dbProject.handle!

        const config = await readEntry(handle, 'index.json', {
            responseType: 'json',
        })

        const response: ProjectData = {
            id,
            type: dbProject.type,
            width: config.width,
            height: config.height,
            layers: [],
        }

        for (const layer of config.layers) {
            const raw = await readEntry(handle, `/layers/${layer.filename}.raw`, {
                responseType: 'arraybuffer',
            })

            const data = new Uint8Array(raw)

            const canvas = new OffscreenCanvas(layer.width, layer.height)
            const ctx = canvas.getContext('2d')!

            const imageData = new ImageData(new Uint8ClampedArray(data), layer.width, layer.height)

            ctx.putImageData(imageData, 0, 0)

            response.layers.push({
                id: layer.id,
                name: layer.name,
                type: layer.type,
                order: layer.order,
                data: canvas,
                width: layer.width,
                height: layer.height,
            })
        }

        return response
    }

    throw new Error('Erro loading project')
}

export async function createProject(payload: Omit<ProjectData, 'id'>): Promise<ProjectData> {
    const id = createId()

    if (payload.type === 'filesystem') {
        const handle = await window.showDirectoryPicker({
            mode: 'readwrite',
        })

        const json: any = {
            id,
            type: payload.type,
            width: payload.width,
            height: payload.height,
            layers: [],
        }

        const drive = createDrive(handle)

        if (await drive.find('/layers')) {
            await drive.destroy('/layers')
        }

        await drive.mkdir('/layers')

        for (const layer of payload.layers) {
            const layerCtx = layer.data.getContext('2d')!
            const order = layer.order || 99
            const filename = `${$number.pad(order)}_${layer.name}`

            const { data } = layerCtx.getImageData(0, 0, layer.width, layer.height)

            const uint8 = new Uint8Array(data)

            const png = await convertBufferToPng(uint8, layer.width, layer.height)

            await drive.write(`/layers/${filename}.raw`, uint8)

            await drive.write(`/layers/${filename}.png`, png)

            json.layers.push({
                id: layer.id || createId(),
                name: layer.name,
                width: layer.width,
                height: layer.height,
                type: layer.type,
                filename,
            })
        }

        const buffer = new TextEncoder().encode(JSON.stringify(json, null, 4))

        await drive.write('/index.json', buffer)

        await $db.projects.add({
            id,
            type: 'filesystem',
            handle,
        })

        return json
    }

    throw new Error('Not implemented')
}

export async function updateProject(id: string, payload: Omit<ProjectData, 'id' | 'type'>) {
    const dbProject = await $db.projects.get(id)

    if (!dbProject) {
        throw new Error('Project not found')
    }

    if (dbProject.type === 'filesystem') {
        const handle = dbProject.handle!

        const json: any = {
            id,
            type: dbProject.type,
            width: payload.width,
            height: payload.height,
            layers: [],
        }

        const drive = createDrive(handle)

        if (await drive.find('/layers')) {
            await drive.destroy('/layers')
        }

        await drive.mkdir('/layers')

        for (const layer of payload.layers) {
            const layerCtx = layer.data.getContext('2d')!
            const order = layer.order || 99
            const filename = `${$number.pad(order)}_${layer.name}`

            const { data } = layerCtx.getImageData(0, 0, layer.width, layer.height)

            const uint8 = new Uint8Array(data)

            const png = await convertBufferToPng(uint8, layer.width, layer.height)

            await drive.write(`/layers/${filename}.raw`, uint8)

            await drive.write(`/layers/${filename}.png`, png)

            json.layers.push({
                id: layer.id || createId(),
                name: layer.name,
                width: layer.width,
                height: layer.height,
                type: layer.type,
                filename,
            })
        }

        const buffer = new TextEncoder().encode(JSON.stringify(json, null, 4))

        await drive.write('/index.json', buffer)

        await $db.projects.add({
            id,
            type: 'filesystem',
            handle,
        })

        return json
    }

    throw new Error('Erro loading project')
}
