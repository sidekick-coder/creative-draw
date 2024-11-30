import { findEntry, destroyEntry, makeDirectoryEntry, writeEntry } from 'drive-fsa'

import type { Layer, ProjectParsed } from '#imports'

async function convertBufferToPng(buffer: Uint8Array, width: number, height: number) {
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
        height: project.height,
        width: project.width,
        layers: [] as Omit<Layer, 'data'>[],
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
            filename,
            order: order,
            name: layer.name,
            type: layer.type,
        })
    }
    const json = new TextEncoder().encode(JSON.stringify(data, null, 4))

    await writeEntry(handle, '/index.json', json)

    return handle
}
