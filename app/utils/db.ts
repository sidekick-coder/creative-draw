import { Dexie, type EntityTable } from 'dexie'

export interface Handle {
    id?: number
    handle: FileSystemDirectoryHandle
    name: string
}

const db = new Dexie('creative-draw') as Dexie & {
    handles: EntityTable<Handle, 'id'>
}

db.version(1).stores({
    handles: '++id,handle,&name',
})

export const $db = db
