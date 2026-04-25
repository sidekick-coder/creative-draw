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

        const baseSize = options.size || 1
        const baseOpacity = options.opacity || 1
        const color = options.color || { r: 0, g: 0, b: 0 }

        const spacing = Math.max(1, baseSize * 0.05) // Adjust spacing based on size

        const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2)
        const steps = Math.floor(distance / spacing)
        const minSize = baseSize * 0.2 // Min size is 20% of the requested size
        const minOpacity = baseOpacity * 0.2 // Min opacity

        for (let i = 0; i <= steps; i++) {
            const t = steps === 0 ? 1 : i / steps

            // 1. Interpolate position
            const x = startX + t * (endX - startX)
            const y = startY + t * (endY - startY)

            // 2. Interpolate pressure
            const rawPressure = startPressure + t * (endPressure - startPressure)

            // 3. Apply a pressure curve (squaring it makes the pen feel firmer)
            const curvedPressure = Math.pow(rawPressure, 1.5)

            // 4. Calculate final size and opacity
            const size = minSize + (baseSize - minSize) * curvedPressure
            const opacity = minOpacity + (baseOpacity - minOpacity) * curvedPressure

            paths.push({
                x,
                y,
                size,
                opacity,
                pressure: rawPressure,
                color,
            })
        }

        return paths
    },
})
