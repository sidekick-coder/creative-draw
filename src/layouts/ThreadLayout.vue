<template>
    <app-layout>
        <div class="flex flex-wrap h-dvh">
            <div class="flex-1 overflow-y-auto">
                <slot />
            </div>

            <cd-card class="w-3/12 rounded-none"> sidebar </cd-card>
        </div>
    </app-layout>
</template>
