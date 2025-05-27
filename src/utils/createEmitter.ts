export interface EmitterObserver {
    name: string
    callback: Function
}

export interface EmitterOptions {
    debug?: boolean
}

export function createEmitter(options: EmitterOptions = {}) {
    const observers = [] as EmitterObserver[]

    function on(name: string, callback: Function) {
        observers.push({ name, callback })

        if (options.debug) {
            console.debug(`[emitter]: Registered observer for ${name}`)
        }
    }

    function off(name: string, callback: Function) {
        const index = observers.findIndex((o) => o.name === name && o.callback === callback)

        if (index !== -1) {
            observers.splice(index, 1)

            if (options.debug) {
                console.debug(`[emitter]: Unregistered observer for ${name}`)
            }
        }
    }

    function emit(name: string, ...args: any[]) {
        observers.forEach((o) => {
            if (o.name === name) {
                o.callback(...args)
            }
        })

        if (options.debug) {
            console.debug(`[emitter]: ${name}`, ...args)
        }
    }

    return {
        on,
        off,
        emit,
    }
}
