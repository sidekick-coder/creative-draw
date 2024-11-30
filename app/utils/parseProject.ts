import { readEntry } from 'drive-fsa'

export interface ProjectParsed {
    name: string
    description?: string
    height: number
    width: number
    layers: Layer[]
    [key: string]: any
}

export interface Layer {
    name: string
    filename: string
    type: 'paint' | 'image'
    order: number
    data: Uint8Array
}

export async function parseProject(handle: FileSystemDirectoryHandle) {
    const config = await readEntry(handle, 'index.json', {
        responseType: 'json',
    })

    const response: ProjectParsed = {
        _handle: handle,
        name: handle.name,
        description: config.description,
        height: config.height,
        width: config.width,
        layers: [],
    }

    for await (const l of config.layers) {
        const data = await readEntry(handle, `/layers/${l.filename}.raw`, {
            responseType: 'arraybuffer',
        })

        response.layers.push({
            name: l.name,
            filename: l.filename,
            type: l.type,
            order: l.order,
            data,
        })
    }

    return response
}
