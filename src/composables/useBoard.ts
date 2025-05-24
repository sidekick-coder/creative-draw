import { createBoard, type Board } from './createBoard.ts'

const key = Symbol('board') as InjectionKey<Board>

export function useBoard() {
    const board = inject(key, null)

    if (!board) {
        return createBoard()
    }

    return board
}
