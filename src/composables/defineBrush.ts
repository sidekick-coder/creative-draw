import type { ColorRGB } from '@/utils/colors'

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
    size: number
    opacity: number
    color: ColorRGB
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
    color: ColorRGB
}

export interface BrushDefinition {
    name: string
    draw: (options: BrushDrawOptions) => BrushPath[]
}

export function defineBrush(brush: BrushDefinition) {
    return brush
}
