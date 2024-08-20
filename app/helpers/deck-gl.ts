import { createContext, MutableRefObject } from 'react'
import type { DeckGLRef } from '@deck.gl/react'
import type { OrthographicView } from '@deck.gl/core'

export type DeckGlRef = DeckGLRef<OrthographicView> | null

export type MutableDeckGlRefObject = MutableRefObject<DeckGlRef>

export const DeckGLRefContext = createContext<MutableDeckGlRefObject | null>(
    null,
)
