import type { Directive } from 'vue'

interface Options {
    value: (e: PointerEvent) => void
    timeout?: number
}

export const vLongPress: Directive<HTMLElement, Options> = {
    mounted(el, { value: callback, timeout = 500 }: any) {
        let timer = null as null | ReturnType<typeof setTimeout>

        function start(e: PointerEvent) {
            timer = setTimeout(() => callback(e), timeout)
        }

        function cancel() {
            if (timer) {
                clearTimeout(timer)
            }
        }

        el.addEventListener('pointerdown', start)
        el.addEventListener('pointerup', cancel)
        el.addEventListener('pointerleave', cancel)
    },
}
