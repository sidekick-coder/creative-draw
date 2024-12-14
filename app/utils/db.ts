import { Dexie, type EntityTable } from 'dexie'
import type { ProjectData } from '~/repositories/projectRepository'

export interface Handle {
    id?: number
    handle: FileSystemDirectoryHandle
    name: string
}

export interface DBProject {
    id: string
    type: string
    handle?: FileSystemDirectoryHandle
    data?: any
}

const db = new Dexie('creative-draw') as Dexie & {
    handles: EntityTable<Handle, 'id'>
    projects: EntityTable<DBProject, 'id'>
}

db.version(1).stores({
    handles: '++id,handle,&name',
    projects: 'id',
})

export const $db = db
