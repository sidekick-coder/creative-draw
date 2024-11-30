import { Dexie, type EntityTable } from 'dexie'

import { destroyEntry, makeDirectoryEntry, readEntry, resolvePath, writeEntry } from 'drive-fsa'

export interface Project {
    id: string
    handle: FileSystemDirectoryHandle
}

export interface Layer {
    name: string
    type: 'paint' | 'image'
    order: number
    data: Uint8Array
}

export interface Handle {
    id?: number
    handle: FileSystemDirectoryHandle
    name: string
}

const db = new Dexie('creative-draw') as Dexie & {
    projects: Dexie.Table<Project, string>
    handles: EntityTable<Handle, 'id'>
}

db.version(1).stores({
    projects: 'id,handle',
    handles: '++id,handle,&name',
})

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

export function listProjects() {
    return db.projects.toArray()
}

export async function showProject(id: string) {
    const project = await db.projects.get(id)

    if (!project) {
        throw new Error('Project not found')
    }

    if ((await project.handle.queryPermission({ mode: 'readwrite' })) !== 'granted') {
        throw new Error('Permission denied to access project files')
    }

    const config = await readEntry(project.handle, 'index.json', {
        responseType: 'json',
    })

    const response: ProjectParsed = {
        _handle: project.handle,
        id: project.id,
        name: project.handle.name,
        description: config.description,
        height: config.height,
        width: config.width,
        layers: [],
    }

    for await (const l of config.layers) {
        const data = await readEntry(project.handle, l.path, {
            responseType: 'arraybuffer',
        })

        response.layers.push({
            name: l.name,
            data,
        })
    }

    return response
}

export async function createProject(
    rootFolder: FileSystemDirectoryHandle,
    payload: Omit<ProjectParsed, 'id'>
) {
    const id = window.crypto.randomUUID()

    const handle = await rootFolder.getDirectoryHandle(payload.name, { create: true })

    const config: any = {
        description: payload.description,
        height: payload.height,
        width: payload.width,
        layers: [],
    }

    await makeDirectoryEntry(handle, '/layers')

    for (const l of payload.layers) {
        const path = resolvePath('/layers', `${l.name}.raw`)

        await writeEntry(handle, path, l.data)
        await writeEntry(
            handle,
            resolvePath('/layers', `${l.name}.png`),
            await convertBufferToPng(l.data, payload.width, payload.height)
        )
        config.layers.push({
            name: l.name,
            description: l.description,
            path: path,
        })
    }

    const json = new TextEncoder().encode(JSON.stringify(config, null, 4))

    await writeEntry(handle, '/index.json', json)

    await db.projects.add({ id, handle })

    return showProject(id)
}

export async function updateProject(id: string, payload: Omit<ProjectParsed, 'id'>) {
    const project = await showProject(id)

    if (!project) {
        throw new Error('Project not found')
    }

    const handle = project._handle

    const config: any = {
        description: payload.description,
        height: payload.height,
        width: payload.width,
        layers: [],
    }

    await destroyEntry(handle, '/layers')

    await makeDirectoryEntry(handle, '/layers')

    for (const l of payload.layers) {
        const path = resolvePath('/layers', `${l.name}.raw`)

        await writeEntry(handle, path, l.data)

        config.layers.push({
            name: l.name,
            path: path,
        })
    }

    const json = new TextEncoder().encode(JSON.stringify(config, null, 4))

    await writeEntry(handle, '/index.json', json)

    return showProject(id)
}

export function deleteProject(id: string) {
    return db.projects.delete(id)
}

export const $db = db
