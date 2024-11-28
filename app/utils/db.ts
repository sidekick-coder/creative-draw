import { Dexie } from 'dexie'

import { listEntries, makeDirectoryEntry, readEntry, resolvePath, writeEntry } from 'drive-fsa'

interface Project {
    id: string
    handle: FileSystemDirectoryHandle
}

interface Layer {
    name: string
    description?: string
    data: Uint8Array
}

interface ProjectParsed {
    id: string
    name: string
    description?: string
    height: number
    width: number
    layers: Layer[]
}

const db = new Dexie('creative-draw') as Dexie & {
    projects: Dexie.Table<Project, string>
}

db.version(1).stores({
    projects: 'id,handle',
})

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
            description: l.description,
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
        const path = resolvePath('/layers', `${l.name}.png`)

        await writeEntry(handle, path, l.data)

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

export function updateProject(id: string, name: string) {
    return db.projects.update(id, { name })
}

export function deleteProject(id: string) {
    return db.projects.delete(id)
}

export const $db = db
