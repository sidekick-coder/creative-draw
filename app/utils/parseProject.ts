import { readEntry } from 'drive-fsa'

export interface ProjectParsed {
    name: string
    description?: string
    height: number
    width: number
    selected_layer?: string
    layers: Layer[]
    [key: string]: any
}

export interface Layer {
    id: string
    name: string
    filename: string
    type: 'paint' | 'image'
    order: number
    data: Uint8Array
    visible?: boolean
    width?: number
    height?: number
}

export async function parseProject(handle: FileSystemDirectoryHandle) {
    const config = await readEntry(handle, 'index.json', {
        responseType: 'json',
    })

    const response: ProjectParsed = {
        _handle: handle,
        name: handle.name,
        selected_layer: config.selected_layer,
        description: config.description,
        height: config.height,
        width: config.width,
        layers: [],
    }

    for await (const l of config.layers) {
        const id = l.id || window.crypto.randomUUID()

        const data = await readEntry(handle, `/layers/${l.filename}.raw`, {
            responseType: 'arraybuffer',
        })

        response.layers.push({
            id,
            ...l,
            data,
        })

        if (!response.selected_layer) {
            response.selected_layer = id
        }
    }

    return response
}
