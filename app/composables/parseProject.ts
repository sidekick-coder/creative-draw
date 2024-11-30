import { readEntry } from 'drive-fsa'

export interface ProjectParsed {
    name: string
    description?: string
    height: number
    width: number
    layers: Layer[]
    [key: string]: any
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
        const data = await readEntry(handle, l.path, {
            responseType: 'arraybuffer',
        })

        response.layers.push({
            name: l.name,
            data,
        })
    }

    return response
}
