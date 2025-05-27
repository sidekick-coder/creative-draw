import { createDatabase } from './createDatabase'

export function createDefaultDatabase() {
    return createDatabase({
        id: 'default',
        name: 'Default',
        type: 'indexdb',
        db_name: 'creative-draw:databases:default',
    })
}
