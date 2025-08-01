import IndexDbDriveGateway from '@/gateways/IndexDbDriveGateway'
import Database from './Database'

export default new IndexDbDriveGateway(Database.files)
