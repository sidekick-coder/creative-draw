import type { Dexie as DexieInstance, EntityTable } from 'dexie'
import type { ProjectData, ProjectDataLayer } from './types'

export interface DBProject {
    id: string
    type: string
}

export interface DBProjectHandle {
    id?: number
    project_id: string
    handle: FileSystemDirectoryHandle
}

export interface DBProjectDataLayer extends Omit<ProjectDataLayer, 'canvas'> {
    data: Uint8ClampedArray
}

export interface DBProjectData extends Omit<ProjectData, 'layers'> {
    id?: number
    project_id: string
    layers: DBProjectDataLayer[]
}

export let db: DexieInstance & {
    projects: EntityTable<DBProject, 'id'>
    project_handles: EntityTable<DBProjectHandle, 'id'>
    project_data: EntityTable<DBProjectData, 'id'>
}

export async function useDb() {
    if (db) return db

    const { Dexie } = await import('dexie')

    db = new Dexie('creative-draw') as any

    db.version(1).stores({
        projects: 'id',
        project_handles: '++id,&project_id',
        project_data: '++id,&project_id',
    })

    return db
}
