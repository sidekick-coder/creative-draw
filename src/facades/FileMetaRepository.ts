import IndexDBFileMetaRepository from '@/repositories/IndexDBFileMetaRepository'
import Database from './Database'

export default new IndexDBFileMetaRepository(Database.file_metas)
