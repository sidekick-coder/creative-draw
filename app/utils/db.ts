import { Dexie, type EntityTable } from 'dexie'
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

export interface DBProjectDataLayer extends Omit<ProjectDataLayer, 'data'> {
    data: Uint8ClampedArray
}

export interface DBProjectData extends Omit<ProjectData, 'layers'> {
    id?: number
    project_id: string
    layers: DBProjectDataLayer[]
}

const db = new Dexie('creative-draw') as Dexie & {
    projects: EntityTable<DBProject, 'id'>
    project_handles: EntityTable<DBProjectHandle, 'id'>
    project_data: EntityTable<DBProjectData, 'id'>
}

db.version(1).stores({
    projects: 'id',
    project_handles: '++id,&project_id',
    project_data: '++id,&project_id',
})

export const $db = db
