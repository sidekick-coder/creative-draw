interface Options {
    ignore?: MaybeRef[]
}

export function onPointerdownOutside(elRef: MaybeRef, cn: () => any, options?: Options) {
    const handlePointerdown = (event: PointerEvent) => {
        const el = unrefElement(elRef)

        // Check if the click occurred inside the element or in any ignored element
        if (!el || el.contains(event.target as Node)) {
            return;
        }

        if (options?.ignore?.some(ignoreRef => {
            const ignoreEl = ignoreRef.value;
            return ignoreEl && ignoreEl.contains(event.target as Node);
        })) {
            return;
        }

        // Call the callback function
        cn();
    };

    onMounted(() => {
        document.addEventListener("pointerdown", handlePointerdown);
    });

    onBeforeUnmount(() => {
        document.removeEventListener("pointerdown", handlePointerdown);
    });
}
