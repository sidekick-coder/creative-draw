import eruda from 'eruda'

let hidden = true

export function toggleEruda() {
    if (hidden) {
        eruda.show()
        hidden = false
        return
    }

    eruda.hide()
    hidden = true
}

export default definePlugin(() => {
    eruda.init()

    eruda.get('entryBtn').hide()
})
