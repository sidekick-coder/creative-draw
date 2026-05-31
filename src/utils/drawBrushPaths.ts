import type { ObjectStroke } from '@/composables/createToolBrush'

function createPathKey(x: number, y: number, pressure: number, size: number, color: ColorRGB) {
    return `${Math.round(x)}-${Math.round(y)}-${pressure.toFixed(2)}-${size.toFixed(2)}-${color.r}-${color.g}-${color.b}`
}

interface ParsedPath {
    x: number
    y: number
    pressure: number
    size: number
    opacity: number
    erase: boolean
}

export function parsePath(path: any): ParsedPath {
    if (Array.isArray(path)) {
        const [x, y, size, opacity, pressure, erase] = path

        return {
            x,
            y,
            pressure,
            size,
            opacity,
            erase: Boolean(erase),
        }
    }

    if (typeof path === 'object' && path !== null) {
        const { x, y, pressure, size, opacity, erase } = path

        return {
            x,
            y,
            pressure,
            size,
            opacity,
            erase: Boolean(erase),
        }
    }

    throw new Error('Invalid path format')
}

export function parseStrokeColor(color: any): ColorRGB {
    if (Array.isArray(color) && color.length === 3) {
        const [r, g, b] = color
        return { r, g, b }
    }

    if (
        typeof color === 'object' &&
        color !== null &&
        'r' in color &&
        'g' in color &&
        'b' in color
    ) {
        const { r, g, b } = color
        return { r, g, b }
    }

    throw new Error('Invalid color format')
}

export function drawBrushPath(
    ctx: CanvasRenderingContext2D,
    paths: ObjectStroke['paths'],
    color: ObjectStroke['color'],
    exclude = new Set<string>()
) {
    const parsedColor = parseStrokeColor(color)

    paths.forEach((p) => {
        const { x, y, pressure, opacity, erase, size } = parsePath(p)

        const key = createPathKey(x, y, pressure, size, parsedColor)

        if (exclude.has(key)) {
            return
        }

        exclude.add(key)

        if (erase) {
            ctx.globalCompositeOperation = 'destination-out'
            ctx.globalAlpha = opacity
            ctx.fillStyle = `rgb(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b})`
            ctx.beginPath()
            ctx.arc(x, y, size / 2, 0, Math.PI * 2)
            ctx.fill()
            ctx.closePath()
            ctx.globalCompositeOperation = 'source-over'
            return
        }

        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = opacity
        ctx.fillStyle = `rgb(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b})`
        ctx.beginPath()
        ctx.arc(x, y, size / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()
    })
}
