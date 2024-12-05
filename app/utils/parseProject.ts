import { readEntry } from 'drive-fsa'

export interface LayerBase {
    id: string
    name: string
    type: 'paint' | 'image'
    order: number
    visible?: boolean
}

export interface LayerPaint extends LayerBase {
    type: 'paint'
    width: number
    height: number
    data: Uint8Array
    filename?: string
}

export interface LayerImage extends LayerBase {
    type: 'image'
    width: number
    height: number
    data: Uint8Array
    x: number
    y: number
}

export type Layer = LayerPaint | LayerImage

export interface ProjectParsed {
    name: string
    description?: string
    height: number
    width: number
    selected_layer?: string
    layers: Layer[]

    current_scale: number
    current_offset_x: number
    current_offset_y: number

    [key: string]: any
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

        current_scale: config.current_scale || 1,
        current_offset_x: config.current_offset_x || 0,
        current_offset_y: config.current_offset_y || 0,

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

    response.layers.sort((a, b) => b.order - a.order)

    return response
}
