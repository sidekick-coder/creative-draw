import { useBreakpoints as baseUseBreakpoints, breakpointsTailwind } from '@vueuse/core'
export function useBreakpoint() {
    const breakpoints = baseUseBreakpoints(breakpointsTailwind)

    return breakpoints
}
