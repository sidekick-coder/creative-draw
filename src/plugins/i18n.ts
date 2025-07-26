declare module 'vue' {
    interface ComponentCustomProperties {
        $t: typeof __
    }
}

export default definePlugin(({ app }) => {
    app.config.globalProperties.$t = __
})
