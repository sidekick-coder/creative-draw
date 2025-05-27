import type { App } from 'vue'

export interface DefinePluginOptions {
    app: App
}

export interface Plugin {
    (options: DefinePluginOptions): void
}

export function definePlugin(plugin: Plugin): Plugin {
    return plugin
}
