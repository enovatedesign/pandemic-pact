'use client'

import { createContext } from "react";

export const CurrentEntry = createContext<{
    sectionHandle: string
    uri: string
    typeHandle: string
}>({
    sectionHandle: '',
    uri: '',
    typeHandle: '',
})
