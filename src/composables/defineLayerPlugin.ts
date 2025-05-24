import type { Layer } from './useLayer'

export interface LayerPlugin {
    install: (layer: Layer) => void
}

export function defineLayerPlugin<T extends LayerPlugin>(plugin: T): T {
    return plugin
}
