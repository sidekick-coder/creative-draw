<script setup lang="ts">
const googleAdsenseClientId = ''

let script = document.createElement('script')

function load() {
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
}

function unload() {
    document.head.removeChild(script)
}

if (import.meta.env.GOOGLE_ADSENSE_CLIENT_ID) {
    onMounted(load)

    onUnmounted(unload)
}
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
