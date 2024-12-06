export interface BrushPosition {
    x: number
    y: number
}

export interface BrushSettings {
    color: string
    size: number
    opacity: number
    [key: string]: any
}

export interface BrushOptions {
    position: BrushPosition
    settings: BrushSettings
    event: PointerEvent
    ctx: CanvasRenderingContext2D
    pressure?: number
}

export interface Brush {
    name: string
    start: (options: BrushOptions) => void
    stop: (options: BrushOptions) => void
    draw: (options: BrushOptions) => void
}

export function defineBrush(cb: Brush | (() => Brush)): Brush {
    return cb instanceof Function ? cb() : cb
}
