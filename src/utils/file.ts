interface PickOptions {
    accept?: string
    multiple?: boolean
}

type PickResult<T extends PickOptions> = T['multiple'] extends true ? File[] : File | null

function pick<T extends PickOptions>(options: T): Promise<PickResult<T>> {
    return new Promise((resolve) => {
        const input = document.createElement('input')

        input.type = 'file'
        input.accept = options.accept || '*/*'
        input.multiple = options.multiple || false

        input.onchange = (e) => {
            const target = e.target as HTMLInputElement
            const files = Array.from(target.files as FileList) as File[]

            resolve((options.multiple ? Array.from(files) : files[0]) as PickResult<T>)
        }

        input.oncancel = () => {
            resolve(options.multiple ? [] : (null as any))
        }

        input.click()
    })
}

function toUint8Array(file: File): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            if (e.target?.result instanceof ArrayBuffer) {
                resolve(new Uint8Array(e.target.result))
            } else {
                reject(new Error('Failed to read file as ArrayBuffer'))
            }
        }

        reader.onerror = () => {
            reject(reader.error)
        }

        reader.readAsArrayBuffer(file)
    })
}

export const $file = {
    pick,
    toUint8Array,
}
