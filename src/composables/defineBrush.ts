export interface BrushStartOptions {
    x: number
    y: number
    pressure: number
}

export interface BrushDrawOptions {
    lastX: number
    lastY: number
    lastPressure: number
    x: number
    y: number
    pressure: number
}

export interface BrushEndOptions {
    x: number
    y: number
    pressure: number
}

export interface BrushPath {
    x: number
    y: number
    size: number
    opacity: number
    pressure: number
    color: string
}

export interface BrushDefinition {
    name: string
    draw: (options: BrushDrawOptions) => BrushPath[]
}

export function defineBrush(brush: BrushDefinition) {
    return brush
}
