import { defineBrush, type BrushPath } from '@/composables/defineBrush'

interface PencilParams {
    id: string
    name: string
    jitter: number
}

export function definePencilBrush(penParams: PencilParams) {
    return defineBrush({
        id: penParams.id,
        name: penParams.name,
        draw(options) {
            const paths: BrushPath[] = []
            const startX = options.lastX || options.x
            const startY = options.lastY || options.y
            const startPressure = options.lastPressure || options.pressure

            const endX = options.x
            const endY = options.y
            const endPressure = options.pressure

            const gap = 1

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

            // Generate random dots for each point
            for (const point of points) {
                const baseSize = options.size * point.pressure
                const dotSize = baseSize * 0.1 // 10% of point size
                const color = options.color || { r: 0, g: 0, b: 0 }

                // Generate a random number of dots around each point
                const numDots = Math.floor(Math.random() * 5) + 1 // 1-5 dots per point

                for (let j = 0; j < numDots; j++) {
                    // Random offset within the original point size area
                    const offsetRadius = baseSize * 0.5
                    const angle = Math.random() * 2 * Math.PI
                    const distance = Math.random() * offsetRadius

                    // Apply jitter to position
                    const jitterX = (Math.random() - 0.5) * penParams.jitter * baseSize
                    const jitterY = (Math.random() - 0.5) * penParams.jitter * baseSize

                    const dotX = point.x + Math.cos(angle) * distance + jitterX
                    const dotY = point.y + Math.sin(angle) * distance + jitterY

                    // Apply jitter to dot size
                    const sizeJitter = 1 + (Math.random() - 0.5) * penParams.jitter
                    const jitteredDotSize = dotSize * sizeJitter

                    paths.push({
                        x: dotX,
                        y: dotY,
                        size: jitteredDotSize,
                        pressure: point.pressure,
                        color: color,
                    })
                }
            }

            return paths
        },
    })
}

export default [
    definePencilBrush({
        id: 'pencil-hb',
        name: 'Pencil HB',
        jitter: 0.05,
    }),
    definePencilBrush({
        id: 'pencil-2b',
        name: 'Pencil 2B',
        jitter: 0.1,
    }),
    definePencilBrush({
        id: 'pencil-4b',
        name: 'Pencil 4B',
        jitter: 0.4,
    }),
    definePencilBrush({
        id: 'pencil-6b',
        name: 'Pencil 6B',
        jitter: 0.6,
    }),
    definePencilBrush({
        id: 'pencil-8b',
        name: 'Pencil 8B',
        jitter: 0.8,
    }),
]
