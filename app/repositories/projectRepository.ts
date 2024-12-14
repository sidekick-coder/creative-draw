import { createDrive, destroyEntry, findEntry, makeDirectoryEntry, readEntry } from 'drive-fsa'
import type { Layer } from '@/composables/useInstance'

export interface Project {
    id: string
    type: string
    name?: string
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

export async function listProjects() {
    const dbProjects = await $db.projects.toArray()

    const response = []

    for await (const dbProject of dbProjects) {
        const item: any = {}

        item.id = dbProject.id
        item.type = dbProject.type

        if (item.type === 'filesystem') {
            const handle = dbProject.handle!

            const config = await readEntry(handle, 'index.json', {
                responseType: 'json',
            })

            item.name = config.name || handle.name
            item.width = config.width
            item.height = config.height
            item.layers = config.layers

            if (await findEntry(handle, '/thumbnail.png')) {
                const uint8 = await readEntry(handle, '/thumbnail.png')

                const blob = new Blob([uint8], { type: 'image/png' })

                item.thumbnail = URL.createObjectURL(blob)
            }
        }

        if (item.type === 'indexeddb') {
            const data = dbProject.data!

            item.name = data.name
            item.width = data.width
            item.height = data.height
            item.layers = data.layers
            item.thumbnail = data.thumbnail
        }

        response.push(item)
    }

    return response
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
                visible: !!layer.visible,
            })
        }

        return response
    }

    if (dbProject.type === 'indexeddb') {
        const data = dbProject.data!

        const response: ProjectData = {
            id: dbProject.id,
            type: dbProject.type,
            width: data.width,
            height: data.height,
            layers: [],
        }

        for await (const layer of data.layers) {
            const canvas = new OffscreenCanvas(layer.width, layer.height)
            const ctx = canvas.getContext('2d')!

            const imageData = new ImageData(layer.data, layer.width, layer.height)

            ctx.putImageData(imageData, 0, 0)

            response.layers.push({
                id: layer.id,
                name: layer.name,
                type: layer.type,
                order: layer.order,
                data: canvas,
                width: layer.width,
                height: layer.height,
                visible: !!layer.visible,
            })
        }

        return response
    }

    throw new Error('Erro loading project')
}

export async function importProjectFromHandle(handle: FileSystemDirectoryHandle) {
    const config = await readEntry(handle, 'index.json', {
        responseType: 'json',
    })

    const exists = await $db.projects.get(config.id)

    if (exists) return

    await $db.projects.put({
        id: config.id,
        type: 'filesystem',
        handle,
    })
}

export async function writeProjectToHandle(handle: FileSystemDirectoryHandle, data: ProjectData) {
    const json: any = {
        id: data.id,
        type: data.type,
        width: data.width,
        height: data.height,
        layers: [],
    }

    const drive = createDrive(handle)

    if (await drive.find('/layers')) {
        await drive.destroy('/layers')
    }

    await drive.mkdir('/layers')

    for (const layer of data.layers) {
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
            visible: layer.visible,
            filename,
        })
    }

    const thumbnailCanvas = new OffscreenCanvas(data.width, data.height)
    const thumbnailCtx = thumbnailCanvas.getContext('2d')!

    data.layers
        .reverse()
        .filter((layer) => layer.visible)
        .forEach((l) => {
            thumbnailCtx.drawImage(l.data, 0, 0)
        })

    await drive.write('/index.json', new TextEncoder().encode(JSON.stringify(json, null, 4)))
    await drive.write('/thumbnail.png', (await thumbnailCanvas.convertToBlob()) as any)

    return json
}

export async function createProject(payload: Omit<ProjectData, 'id'>): Promise<ProjectData> {
    const id = createId()

    if (payload.type === 'filesystem') {
        const handle = await window.showDirectoryPicker({
            mode: 'readwrite',
        })

        const json = await writeProjectToHandle(handle, {
            ...payload,
            id,
            type: 'filesystem',
        })

        await $db.projects.put({
            id,
            type: 'filesystem',
            handle,
        })

        return json
    }

    if (payload.type === 'indexeddb') {
        const json: any = {
            id,
            type: 'indexeddb',
            width: payload.width,
            height: payload.height,
            layers: [],
        }

        for await (const layer of payload.layers) {
            const ctx = layer.data.getContext('2d')!

            const data = ctx.getImageData(0, 0, layer.width, layer.height).data

            json.layers.push({
                id: layer.id,
                name: layer.name,
                type: layer.type,
                order: layer.order,
                width: layer.width,
                height: layer.height,
                visible: layer.visible,
                data: data,
            })
        }

        json.thumbnail = await projectToImage({
            project: payload as ProjectData,
            type: 'png',
            responseType: 'base64',
        })

        await $db.projects.put({
            id,
            type: 'indexeddb',
            data: json,
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

        const json = await writeProjectToHandle(handle, {
            ...payload,
            id,
            type: 'filesystem',
        })

        return json
    }

    throw new Error('Erro loading project')
}

export async function deleteProject(id: string) {
    const dbProject = await $db.projects.get(id)

    if (!dbProject) {
        throw new Error('Project not found')
    }

    if (dbProject.type === 'filesystem') {
        // optionally remove folder
        await $db.projects.delete(id)

        return
    }

    if (dbProject.type === 'indexeddb') {
        await $db.projects.delete(id)

        return
    }

    throw new Error('Erro loading project')
}
