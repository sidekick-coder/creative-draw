import type AdapterRunnerGateway from '@/contracts/AdapterRunnerGateway'
import AdapterRepository from '@/facades/AdapterRepository'
import OpenApiAdapterProvider from '@/providers/OpenApiAdapterProvider'

interface RunnerWithId extends AdapterRunnerGateway {
    id: string
}

export class AdapterRunnerService {
    public async list(): Promise<RunnerWithId[]> {
        const adapters = await AdapterRepository.list()
        const runners: RunnerWithId[] = []
        const openai = new OpenApiAdapterProvider()

        for await (const a of adapters) {
            if (a.type === 'openai') {
                const adapterRunners = await openai.provide(a)

                adapterRunners.forEach((runner) => {
                    runners.push({
                        ...runner,
                        id: `${a.id}.${runner.id}`,
                    })
                })
            }
        }

        return runners
    }
}

export default new AdapterRunnerService()
