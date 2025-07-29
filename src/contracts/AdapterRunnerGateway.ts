import type Adapter from '@/entities/Adapter'
import type File from '@/entities/File'

export interface InstructionText {
    type: 'text'
    data: string
}

export interface InstructionImage {
    type: 'image'
    data: File
}

export type Instruction = InstructionText | InstructionImage

export interface RunResponseItemFile {
    type: 'file'
    data: File
}

export interface RunResponseItemText {
    type: 'text'
    data: string
}

export interface RunPayload {
    instructions: Instruction[]
}

export type RunResponseItem = RunResponseItemFile | RunResponseItemText

export default interface AdapterRunnerGateway {
    id: string
    name: string
    adapter: Adapter
    run: (payload: RunPayload) => Promise<RunResponseItem[]>
}
