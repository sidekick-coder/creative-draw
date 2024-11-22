export interface BrushPosition {
    x: number
    y: number
}

export interface BrushSettings {
    color: string
    size: number
    [key: string]: any
}

export interface BrushOptions {
    position: BrushPosition
    settings: BrushSettings
    event: MouseEvent
}

export interface Brush {
    start: (options: BrushOptions) => void
    stop: (options: BrushOptions) => void
    draw: (options: BrushOptions) => void
}

export interface BrushDefinition {
    (ctx: CanvasRenderingContext2D): Brush
}

export function defineBrush(cb: BrushDefinition): BrushDefinition {
    return cb
}
