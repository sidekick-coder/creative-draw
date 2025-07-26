import type { Board } from './createBoard'
import type { TransformPlugin } from './createTransform'

interface Options {
    scale?: MaybeRef<number>
}

export function createZoom(transformer: TransformPlugin, options: Options = {}) {
    let board: Board

    const scale = toRef(options.scale ?? 1)

    function resize() {
        const container = board.context.get('container')

        if (!container) {
            return
        }

        transformer.set('scale', scale.value)
    }

    return defineBoardPlugin(
        reactive({
            scale,
            install(_board) {
                board = _board

                watch(scale, resize, { immediate: true })
            },
        })
    )
}
