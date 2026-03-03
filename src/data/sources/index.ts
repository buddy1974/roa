/**
 * Unified source registry — shared by client-side Chat.tsx (deterministic matching)
 * and server-side api/chat.ts (retrieval, prompt building, citation extraction).
 * No data imports here: keeps the bundle clean and preserves lazy-loading of FAQ data.
 */

export * from './types.ts'
export * from './scoring.ts'
export * from './retrieve.ts'
export * from './citations.ts'
