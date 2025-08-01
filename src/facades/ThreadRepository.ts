import IndexDbThreadRepository from '@/repositories/IndexDBThreadRepository'
import Database from './Database'

export default new IndexDbThreadRepository(Database.threads)
