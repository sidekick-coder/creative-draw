import type Adapter from '@/entities/Adapter'
import type Thread from '@/entities/Thread'
import type ThreadItem from '@/entities/ThreadItem'
import type ThreadImageRepository from './ThreadImageRepository'

export interface RunPayload {
    thread: Thread
    adapter: Adapter
    items: ThreadItem[]
}

export default interface RunnerGateway {
    /**
     * The name of the runner.
     */
    name: string

    /**
     * The description of the runner.
     */
    description: string

    /**
     * Image repository for the runner.
     */
    imageRepository: ThreadImageRepository

    /**
     * The main function to execute the runner.
     */
    run: (payload: RunPayload) => Promise<void>
}
