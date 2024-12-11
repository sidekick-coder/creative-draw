interface Pressure {
    size?: boolean
    opacity?: boolean
}

interface Grain {
    density: number
    size: number
    opacity: number
    jitter: number
}

export interface BrushDefinition {
    id: string
    name: string
    size: number

    opacity?: number
    spacing?: number
    jitter?: number
    pressure?: Pressure
    grain?: Grain
}

export function defineBrush(data: BrushDefinition): BrushDefinition {
    return data
}
