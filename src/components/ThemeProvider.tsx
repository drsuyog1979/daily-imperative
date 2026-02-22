"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
// NOTE: `ThemeProviderProps` should usually be imported from `next-themes` directly.
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
