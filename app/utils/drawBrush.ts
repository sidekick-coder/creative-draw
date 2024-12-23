export interface DrawBrushOptions {
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
    color: { r: number; g: number; b: number }
    x: number
    y: number
    pressure: number
    lastX: number
    lastY: number
    lastPressure: number
    brush: BrushDefinition
    globalCompositeOperation?: 'source-over' | 'destination-out'
}

export function drawBrush(options: DrawBrushOptions) {
    const ctx = options.ctx
    const globalCompositeOperation = options.globalCompositeOperation || 'source-over'

    const brush = options.brush

    const startX = options.lastX
    const startY = options.lastY
    const startPressure = options.lastPressure

    const endX = options.x
    const endY = options.y
    const endPressure = options.pressure

    const gap = 0.1

    const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2)
    const steps = Math.floor(distance / gap)
    const map = new Map<string, { x: number; y: number; pressure: number }>()

    for (let i = 0; i < steps; i++) {
        const t = i / steps
        const x = startX + t * (endX - startX)
        const y = startY + t * (endY - startY)
        const pressure = startPressure + t * (endPressure - startPressure)

        const key = `${Math.round(x)}-${Math.round(y)}`

        map.set(key, { x, y, pressure })
    }

    const points = Array.from(map.values())

    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i]

        if (!p1) continue

        let size = brush.size
        let opacity = brush.opacity || 1
        let x = p1.x
        let y = p1.y
        const color = options.color

        if (brush.pressure?.size) {
            size = brush.size * p1.pressure
        }

        if (brush.pressure?.opacity) {
            opacity = opacity * p1.pressure
        }

        if (brush.jitter) {
            const jitter = brush.jitter * Math.random() * size

            x += (Math.random() - 0.5) * jitter
            y += (Math.random() - 0.5) * jitter
        }

        if (brush.grain) {
            for (let j = 0; j < brush.grain.density; j++) {
                const grainOpacity = brush.grain.opacity * (0.8 + Math.random() * 0.2)
                const grainSize = brush.grain.size * (0.9 + Math.random() * 0.2)

                const offsetX = (Math.random() - 0.5) * size * brush.grain.jitter
                const offsetY = (Math.random() - 0.5) * size * brush.grain.jitter

                ctx.globalAlpha = grainOpacity
                ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${grainOpacity})`
                ctx.beginPath()
                ctx.arc(x + offsetX, y + offsetY, grainSize / 2, 0, Math.PI * 2)
                ctx.fill()
            }

            continue
        }

        ctx.globalAlpha = opacity
        ctx.globalCompositeOperation = globalCompositeOperation
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`

        ctx.beginPath()
        ctx.arc(x, y, size / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()
    }

    return { points }
}
