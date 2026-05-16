import type { createDrive } from 'drive-fsa'

export function createAutoreloadPull(
    drive: ReturnType<typeof createDrive>,
    projectId: Ref<string>,
    onChanged: () => void,
    interval = 5000
) {
    const lastTimestamp = ref<string | null>(null)
    let timer: ReturnType<typeof setInterval> | null = null

    function getPath() {
        return `/projects/${projectId.value}/pulltimestamp.txt`
    }

    async function check() {
        const exists = await drive.find(getPath())

        if (!exists) {
            const initial = Date.now().toString()
            await drive.write(getPath(), initial as any, { contentType: 'text' })
            lastTimestamp.value = initial
            return
        }

        const content = (await drive.read(getPath(), { contentType: 'text' })) as string

        if (lastTimestamp.value === null) {
            lastTimestamp.value = content
            return
        }

        if (content !== lastTimestamp.value) {
            lastTimestamp.value = content
            onChanged()
        }
    }

    function start() {
        lastTimestamp.value = null
        check()
        timer = setInterval(check, interval)
    }

    function stop() {
        if (timer !== null) {
            clearInterval(timer)
            timer = null
        }
        lastTimestamp.value = null
    }

    return { start, stop }
}
