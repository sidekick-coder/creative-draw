import type Adapter from '@/entities/Adapter'
import type AdapterRunnerGateway from './AdapterRunnerGateway'

export default interface AdapterRunnerProvider {
    provide: (adapter: Adapter) => Promise<AdapterRunnerGateway[]>
}
