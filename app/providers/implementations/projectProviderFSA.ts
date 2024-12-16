import type { ProjectData } from '~/utils/types'
import type { IProjectProvider } from '../IProjectProvider'
import { createDrive, findEntry, readEntry } from 'drive-fsa'

export async function writeProjectToHandle(handle: FileSystemDirectoryHandle, data: ProjectData) {
    const json: any = {
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
export function createProjectProviderFSA(): IProjectProvider {
    const get: IProjectProvider['get'] = async (id: string) => {
        const dbHandle = await $db.project_handles.where('project_id').equals(id).first()

        if (!dbHandle) {
            throw new Error(`Project ${id} not found`)
        }

        const handle = dbHandle.handle

        const config = await readEntry(handle, 'index.json', {
            responseType: 'json',
        })

        const response: ProjectData = {
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

        if (await findEntry(handle, '/thumbnail.png')) {
            const thumbnail = await readEntry(handle, '/thumbnail.png')

            const blob = new Blob([thumbnail], { type: 'image/png' })

            response.thumbnail = URL.createObjectURL(blob)
        }

        return response
    }

    const create: IProjectProvider['create'] = async (id, payload) => {
        const handle = await window.showDirectoryPicker({
            mode: 'readwrite',
        })

        await writeProjectToHandle(handle, payload)

        await $db.project_handles.put({ project_id: id, handle })

        return payload
    }

    const update: IProjectProvider['update'] = async (id, payload) => {
        const dbHandle = await $db.project_handles.where('project_id').equals(id).first()

        if (!dbHandle) {
            throw new Error(`Project ${id} not found`)
        }

        const handle = dbHandle.handle

        await writeProjectToHandle(handle, payload)

        return payload
    }

    const destroy: IProjectProvider['destroy'] = async (id) => {
        console.log(`Deleting project ${id} in FSA`)
    }

    return {
        id: 'filesystem',
        label: 'Folder',
        icon: 'heroicons:folder-open-solid',
        create,
        get,
        update,
        destroy,
    }
}
