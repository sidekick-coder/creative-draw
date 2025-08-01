import IndexDbThreadItemRepository from '@/repositories/IndexDBThreadItemRepository'
import Database from './Database'

export default new IndexDbThreadItemRepository(Database.thread_items)
