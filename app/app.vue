<template>
    <nuxt-layout>
        <nuxt-page />
    </nuxt-layout>
</template>

<style>
body {
    @apply bg-body-800 text-body-0;
}
/* Scrollbar */
*::-webkit-scrollbar {
    width: 0.5em;
    height: 0.5em;
}

*::-webkit-scrollbar-track {
    background: rgb(var(--color-body-800));
}

*::-webkit-scrollbar-corner {
    background: rgb(var(--color-body-800));
}

*::-webkit-scrollbar-thumb {
    background-color: rgb(var(--color-body-600));
}

/* .bg-body-700 {
    *::-webkit-scrollbar-track {
        background: rgb(var(--color-body-800))
    }

    *::-webkit-scrollbar-corner {
        background: rgb(var(--color-body-800))
    }

    *::-webkit-scrollbar-thumb {
        background-color: rgb(var(--color-body-500));
    }

} */
</style>
