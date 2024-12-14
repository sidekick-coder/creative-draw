const w = process.server ? {} : window

const flags = ref({
    // show if file system api is available
    fsa: 'showSaveFilePicker' in w,
})

export const $flags = flags
