import type { Board } from './createBoard'

export interface BoardPlugin {
    install: (board: Board) => void
}

export function defineBoardPlugin<T extends BoardPlugin>(plugin: T) {
    return reactive(plugin)
}
