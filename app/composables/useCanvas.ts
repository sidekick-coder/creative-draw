const key = Symbol('canvas') as InjectionKey<HTMLCanvasElement>

export function provideCanvas(canvas: HTMLCanvasElement) {
    provide(key, canvas)
}

export function useCanvas() {
    const canvas = inject(key)

    if (!canvas) {
        throw new Error('Canvas not provided')
    }

    const ctx = canvas.getContext('2d')

    return { canvas, ctx }
}
