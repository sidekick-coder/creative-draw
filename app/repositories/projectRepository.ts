import { readEntry } from 'drive-fsa'
import { createProjectProviderFSA } from '~/providers/implementations/projectProviderFSA'
import { createProjectProviderIndexDB } from '~/providers/implementations/projectProviderIndexDB'

export const providers = [createProjectProviderFSA(), createProjectProviderIndexDB()]

export async function listProjects() {
    const dbProjects = await $db.projects.toArray()

    const response: ProjectDataWithIdAndType[] = []

    for await (const dbProject of dbProjects) {
        const provider = providers.find((p) => p.id === dbProject.type)

        if (!provider) continue

        const [project, error] = await tryCatch(() => provider.get(dbProject.id))

        if (error) {
            console.error(error)
            continue
        }

        response.push({
            id: dbProject.id,
            type: dbProject.type,
            ...project,
        })
    }

    return response
}

export async function findProject(id: string): Promise<ProjectDataWithIdAndType> {
    const dbProject = await $db.projects.get(id)

    if (!dbProject) {
        throw new Error('Project not found')
    }

    const provider = providers.find((p) => p.id === dbProject.type)

    if (!provider) {
        throw new Error('Provider not found')
    }

    const project = await provider.get(id)

    return {
        id,
        type: dbProject.type,
        ...project,
    }
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

export async function createProject(
    payload: Omit<ProjectDataWithIdAndType, 'id'>
): Promise<ProjectDataWithIdAndType> {
    const provider = providers.find((p) => p.id === payload.type)

    if (!provider) {
        throw new Error('Provider not found')
    }

    const id = createId()

    await $db.projects.put({ id, type: payload.type })

    const [project, error] = await tryCatch(() => provider.create(id, payload))

    if (error) {
        console.error(error)
        await $db.projects.delete(id)
        throw new Error('Error creating project')
    }

    return {
        ...project,
        id,
        type: payload.type,
    }
}

export async function updateProject(id: string, payload: Omit<ProjectData, 'id' | 'type'>) {
    const dbProject = await $db.projects.get(id)

    if (!dbProject) {
        throw new Error('Project not found')
    }

    const provider = providers.find((p) => p.id === dbProject.type)

    if (!provider) {
        throw new Error('Provider not found')
    }

    await provider.update(id, payload)
}

export async function deleteProject(id: string) {
    const dbProject = await $db.projects.get(id)

    if (!dbProject) {
        throw new Error('Project not found')
    }

    const provider = providers.find((p) => p.id === dbProject.type)

    if (!provider) {
        throw new Error('Provider not found')
    }

    await provider.destroy(id)

    await $db.projects.delete(id)
}
