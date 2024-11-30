import { findEntry, destroyEntry, makeDirectoryEntry, writeEntry } from 'drive-fsa'

import type { Layer, ProjectParsed } from '#imports'

export async function convertBufferToPng(buffer: Uint8Array, width: number, height: number) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    canvas.width = width
    canvas.height = height

    const imageData = new ImageData(new Uint8ClampedArray(buffer), width, height)

    ctx.putImageData(imageData, 0, 0)

    const dataUrl = canvas.toDataURL('image/png')

    const blob = await fetch(dataUrl).then((res) => res.blob())

    return new Uint8Array(await blob.arrayBuffer()) as Uint8Array
}

export async function saveProject(handle: FileSystemDirectoryHandle, project: ProjectParsed) {
    const data = {
        description: project.description,
        selected_layer: project.selected_layer,
        height: project.height,
        width: project.width,
        layers: [] as Partial<Layer>[],
    }

    if (await findEntry(handle, '/layers')) {
        await destroyEntry(handle, '/layers')
    }

    await makeDirectoryEntry(handle, '/layers')

    for (const layer of project.layers) {
        const order = layer.order || 99
        const filename = `${$number.pad(order)}_${layer.name}`

        await writeEntry(handle, `/layers/${filename}.raw`, layer.data)

        await writeEntry(
            handle,
            `/layers/${filename}.png`,
            await convertBufferToPng(layer.data, project.width, project.height)
        )

        data.layers.push({
            ...layer,
            data: undefined,
            filename,
            order: order,
            name: layer.name,
            type: layer.type,
            width: layer.width || project.width,
            height: layer.height || project.height,
        })
    }
    const json = new TextEncoder().encode(JSON.stringify(data, null, 4))

    await writeEntry(handle, '/index.json', json)

    return handle
}
