import type Adapter from '@/entities/Adapter'
import type FileMeta from '@/entities/FileMeta'
import type Thread from '@/entities/Thread'
import type ThreadItem from '@/entities/ThreadItem'
import type { IndexDbFile } from '@/gateways/IndexDbDriveGateway'
import Dexie from 'dexie'

const db = new Dexie('default') as Dexie & {
    adapters: Dexie.Table<Adapter, string>
    files: Dexie.Table<IndexDbFile, string>
    file_metas: Dexie.Table<FileMeta, string>
    threads: Dexie.Table<Thread, string>
    thread_items: Dexie.Table<ThreadItem, string>
}

db.version(1).stores({
    adapters: 'id',
    files: 'id,filename',
    file_metas: 'fileId,name',
    threads: 'id',
    thread_items: 'id',
})

export default db
