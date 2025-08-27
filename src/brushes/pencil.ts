import cd from './cd'

interface PencilParams {
    id: string
    name: string
    opacity: number
    size: number
    jitter: number
}

export function definePencilBrush(penParams: PencilParams) {
    return defineBrush({
        id: penParams.id,
        name: penParams.name,
        draw(options) {
            const base = cd.draw(options)

            return base.map((path) => {
                const jitterX = (Math.random() - 0.5) * penParams.jitter
                const jitterY = (Math.random() - 0.5) * penParams.jitter
                const x = path.x + jitterX
                const y = path.y + jitterY
                const size = path.size * penParams.size
                const opacity = Math.min(1, path.opacity * penParams.opacity)
                return {
                    ...path,
                    x,
                    y,
                    size,
                    opacity,
                }
            })
        },
    })
}

export default [
    definePencilBrush({
        id: 'pencil-2b',
        name: 'Pencil 2B',
        opacity: 1.2,
        size: 1.1,
        jitter: 0.8,
    }),
]
