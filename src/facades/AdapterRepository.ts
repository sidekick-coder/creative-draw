import IndexDBAdapterRepository from '@/repositories/IndexDBAdapterRepository'
import Database from './Database'

export default new IndexDBAdapterRepository(Database.adapters)
