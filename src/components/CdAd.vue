<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()

const { googleAdsenseClientId } = runtimeConfig.public

let script = document.createElement('script')

onMounted(() => {
    script.setAttribute('async', '')
    script.setAttribute(
        'src',
        `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${googleAdsenseClientId}`
    )
    document.head.appendChild(script)

    if (!window.adsbygoogle) {
        window.adsbygoogle = []
    }

    window.adsbygoogle.push({})
})

onUnmounted(() => {
    document.head.removeChild(script)
})
</script>

<template>
    <ins
        class="adsbygoogle"
        style="display: block"
        :data-ad-client="googleAdsenseClientId"
        data-ad-slot="4962070728"
        data-ad-format="autorelaxed"
    ></ins>
</template>
