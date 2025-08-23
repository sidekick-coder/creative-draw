import type { BrushDefinition } from './defineBrush'

interface BrushModule {
    default: BrushDefinition
}

export function useBrushes() {
    const modules = import.meta.glob<BrushModule>('@/brushes/*.ts', { eager: true })
    const brushes: BrushDefinition[] = []

    for (const path in modules) {
        const mod = modules[path] as BrushModule

        if (mod && mod.default) {
            brushes.push(mod.default)
        }
    }

    return brushes
}
