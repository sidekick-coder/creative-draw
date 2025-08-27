export default defineBrush({
    id: 'cd01',
    name: 'CD-01',
    draw(options) {
        const paths: BrushPath[] = []
        const startX = options.lastX || options.x
        const startY = options.lastY || options.y
        const startPressure = options.lastPressure || options.pressure

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

            let size = options.size
            const opacity = options.opacity
            const color = options.color || { r: 0, g: 0, b: 0 }

            const x = p1.x
            const y = p1.y

            size = size * p1.pressure

            paths.push({
                x: x,
                y: y,
                size: size,
                opacity: opacity,
                pressure: p1.pressure,
                color: color,
            })
        }

        return paths
    },
})
