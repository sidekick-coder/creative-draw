import type { App } from 'vue'

export interface Options {
    app: App
}

export interface Plugin {
    (options: Options): void
}

export function definePlugin(plugin: Plugin): Plugin {
    return plugin
}
