import type { Board } from './createBoard'
import type { Layer } from './useLayer'
import type { LayerMouseEvent } from './createLayer'
import { defineObjectRender } from './defineObjectRender'

interface CreateInpectorOptions {
    board: Board
    active?: MaybeRef<boolean>
    debug?: boolean
}

export function useInspectorOptions(board: Board) {
    const layerId = board.context.ref<string | null>('tools:inspector:layer-id', null)
    const objectId = board.context.ref<string | null>('tools:inspector:object-id', null)
    const formOpen = board.context.ref('tools:inspector:form-open', false)

    return {
        layerId,
        objectId,
        formOpen,
    }
}
export function createToolInspector(options: CreateInpectorOptions) {
    const active = toRef(options.active ?? false)

    return defineBoardPlugin({
        active,
        install(board: Board) {
            // board.emitter.on('layer:added', (layer: Layer) => {})
        },
    })
}
