export const INTERACTION_TYPES = ['open', 'none'] as const
export type InteractionType = typeof INTERACTION_TYPES[number]
