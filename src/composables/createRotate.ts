import { watch } from 'vue'
import { defineBoardPlugin } from './defineBoardPlugin'
import { onHotKey } from './onHotKey'
import type { TransformPlugin } from './createTransform'

interface CreateRotateOptions {
    angle?: MaybeRef<number>
    debug?: boolean
}

export function createRotate(transformer: TransformPlugin, options: CreateRotateOptions = {}) {
    const rotator = document.createElement('div')
    const angle = toRef(options.angle ?? 0)

    rotator.id = 'rotator'
    rotator.classList.add('absolute', 'inset-0', 'cursor-', 'bg-blue-500', 'opacity-0')

    function setRotation() {
        transformer.set('rotate', `${angle.value}deg`)
    }

    function reset() {
        if (options.debug) console.debug('[rotate] reset')
        angle.value = 0
    }

    function attach() {
        const isAttached = document.body.contains(rotator)
        if (isAttached) return
        if (options.debug) console.debug('[rotate] attach')
        document.body.appendChild(rotator)
    }

    function detach() {
        if (options.debug) console.debug('[rotate] detach')
        if (rotator.parentElement) {
            rotator.parentElement.removeChild(rotator)
        }
    }

    let rotating = false
    let lastMouseX = 0
    let lastAngle = 0

    rotator.addEventListener('mousedown', function (event) {
        event.preventDefault()
        event.stopPropagation()
        rotating = true
        lastMouseX = event.clientX
        lastAngle = angle.value
        if (options.debug) console.debug('[rotate] mousedown')
    })

    rotator.addEventListener('mousemove', function (event) {
        if (!rotating) return
        const deltaX = event.clientX - lastMouseX
        angle.value = (lastAngle + deltaX) % 360
        if (options.debug) console.debug('[rotate] mousemove', angle.value)
    })

    rotator.addEventListener('mouseup', function () {
        if (!rotating) return
        rotating = false
        if (options.debug) console.debug('[rotate] mouseup')
    })

    return defineBoardPlugin(
        reactive({
            reset,
            angle,
            install() {
                watch(angle, setRotation, { immediate: true })
                onHotKey('ctrl+shift+space', attach)
                document.addEventListener('keyup', function (event) {
                    if (event.ctrlKey || event.shiftKey || event.code === 'Space') {
                        detach()
                    }
                })
            },
        })
    )
}
